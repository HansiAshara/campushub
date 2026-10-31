package com.campushub.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Deterministic text preprocessing service for academic resources.
 * <p>
 * Cleans, sanitizes, and normalizes extracted text from documents before feeding
 * into LLM prompts or vector embeddings.
 * Features:
 * <ul>
 *   <li>Normalizes unicode spaces, control characters, and line endings.</li>
 *   <li>Strips solitary page numbering lines and separator artifacts.</li>
 *   <li>Collapses multiple consecutive blank lines to preserve paragraph structure.</li>
 *   <li>Applies quality checks to detect empty, scanned, or non-meaningful extractions.</li>
 *   <li>Generates natural paragraph/sentence-bounded chunks for long documents.</li>
 * </ul>
 */
@Service
public class TextPreprocessorService {

    private static final Logger log = LoggerFactory.getLogger(TextPreprocessorService.class);

    /**
     * Minimum number of non-whitespace characters required to consider text meaningful for AI.
     */
    public static final int MIN_MEANINGFUL_CHAR_COUNT = 50;

    /**
     * Minimum number of words required for a document to be analyzed by AI.
     */
    public static final int MIN_MEANINGFUL_WORD_COUNT = 10;

    /**
     * Target character length per chunk (approx. 700-900 tokens), safe for free-tier quotas.
     */
    public static final int DEFAULT_TARGET_CHUNK_SIZE = 3500;

    /**
     * Maximum character size of a chunk before forcing a boundary split.
     */
    public static final int MAX_CHUNK_SIZE = 4500;

    // Regex for standalone page numbering artifacts: e.g., "Page 1", "Page 1 of 12", "1 / 15", "- 2 -"
    private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile(
            "^(?i)\\s*(-|—|_|\\[)?\\s*(page\\s*\\d+(\\s*(of|/)\\s*\\d+)?|\\d+\\s*(of|/)\\s*\\d+|\\d+)\\s*(-|—|_|\\])?\\s*$"
    );

    // Regex for horizontal decorative lines: e.g., "------", "======", "******", "______"
    private static final Pattern SEPARATOR_LINE_PATTERN = Pattern.compile(
            "^\\s*[-=_*~]{3,}\\s*$"
    );

    // Regex for non-printable control characters except newline and tab
    private static final Pattern CONTROL_CHARS_PATTERN = Pattern.compile(
            "[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]"
    );

    // Regex for abnormal unicode spaces (NBSP, zero-width, figure spaces, etc.)
    private static final Pattern UNICODE_SPACES_PATTERN = Pattern.compile(
            "[\\u00A0\\u2000-\\u200B\\u202F\\u205F\\u3000\\uFEFF]"
    );

    /**
     * Preprocesses an already extracted document.
     *
     * @param extracted The raw document extraction result.
     * @return CleanedDocument with normalized text, quality metrics, and structured chunks.
     */
    public CleanedDocument preprocess(ExtractedDocument extracted) {
        if (extracted == null) {
            return CleanedDocument.empty("Extracted document is null");
        }

        if (extracted.isEncrypted()) {
            return CleanedDocument.empty("Document is encrypted or password-protected");
        }

        if (!extracted.hasExtractableText() || extracted.text() == null || extracted.text().isBlank()) {
            return CleanedDocument.empty(
                    extracted.errorMessage() != null
                            ? extracted.errorMessage()
                            : "Document contains no extractable text (likely a scanned image or empty document)"
            );
        }

        String cleaned = cleanText(extracted.text());
        int originalChars = extracted.text().length();
        int cleanedChars = cleaned.length();
        int wordCount = countWords(cleaned);

        if (cleanedChars < MIN_MEANINGFUL_CHAR_COUNT || wordCount < MIN_MEANINGFUL_WORD_COUNT) {
            log.warn("Extracted text is too short ({} chars, {} words) for meaningful AI analysis.",
                    cleanedChars, wordCount);
            return new CleanedDocument(
                    cleaned,
                    originalChars,
                    cleanedChars,
                    wordCount,
                    extracted.pageCount(),
                    List.of(),
                    false,
                    "Document text contains insufficient content (" + cleanedChars + " characters, " + wordCount + " words)"
            );
        }

        List<TextChunk> chunks = chunkText(cleaned, DEFAULT_TARGET_CHUNK_SIZE);

        log.info("Successfully preprocessed document: {} original chars -> {} clean chars, {} words, {} chunks.",
                originalChars, cleanedChars, wordCount, chunks.size());

        return new CleanedDocument(
                cleaned,
                originalChars,
                cleanedChars,
                wordCount,
                extracted.pageCount(),
                chunks,
                true,
                "Text successfully cleaned and structured into " + chunks.size() + " chunk(s)"
        );
    }

    /**
     * Cleans and normalizes raw text deterministically.
     *
     * @param rawText Unprocessed raw string from PDF, Word, or PowerPoint extractor.
     * @return Sanitized, whitespace-normalized string.
     */
    public String cleanText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }

        // 1. Remove non-printable control characters
        String text = CONTROL_CHARS_PATTERN.matcher(rawText).replaceAll("");

        // 2. Normalize strange unicode spaces to standard space
        text = UNICODE_SPACES_PATTERN.matcher(text).replaceAll(" ");

        // 3. Normalize all line breaks to \n
        text = text.replace("\r\n", "\n").replace('\r', '\n');

        // 4. Process line-by-line: trim lines, filter out solitary page numbers and decorative lines
        String[] lines = text.split("\n");
        StringBuilder cleanedLines = new StringBuilder();
        int consecutiveEmptyLines = 0;

        for (String line : lines) {
            String trimmedLine = line.trim();

            if (trimmedLine.isEmpty()) {
                consecutiveEmptyLines++;
                if (consecutiveEmptyLines <= 2) {
                    cleanedLines.append("\n");
                }
                continue;
            }

            // Check if this line is an obvious extraction artifact
            if (PAGE_NUMBER_PATTERN.matcher(trimmedLine).matches()
                    || SEPARATOR_LINE_PATTERN.matcher(trimmedLine).matches()) {
                continue;
            }

            consecutiveEmptyLines = 0;

            // Collapse multiple internal horizontal whitespace (spaces/tabs) to a single space
            String normalizedLine = trimmedLine.replaceAll("[ \\t]+", " ");
            cleanedLines.append(normalizedLine).append("\n");
        }

        // 5. Final trim
        return cleanedLines.toString().trim();
    }

    /**
     * Splits text into logical, paragraph- and sentence-respecting chunks.
     * Prevents cutting words in half and preserves contextual paragraphs for the LLM.
     *
     * @param text            The clean text.
     * @param targetChunkSize Preferred maximum chunk size in characters.
     * @return List of TextChunk records.
     */
    public List<TextChunk> chunkText(String text, int targetChunkSize) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<TextChunk> chunks = new ArrayList<>();

        // If the entire text fits comfortably inside one chunk, return single chunk
        if (text.length() <= targetChunkSize) {
            chunks.add(new TextChunk(0, text, text.length(), countWords(text)));
            return chunks;
        }

        // Split text by paragraphs first (two or more newlines)
        String[] paragraphs = text.split("\\n\\s*\\n");
        StringBuilder currentChunk = new StringBuilder();
        int chunkIndex = 0;

        for (String paragraph : paragraphs) {
            String trimmedPara = paragraph.trim();
            if (trimmedPara.isEmpty()) {
                continue;
            }

            // If a single paragraph is larger than targetChunkSize, split it by sentences
            if (trimmedPara.length() > targetChunkSize) {
                List<String> sentences = splitIntoSentences(trimmedPara);
                for (String sentence : sentences) {
                    if (currentChunk.length() + sentence.length() + 1 > targetChunkSize && currentChunk.length() > 0) {
                        String chunkStr = currentChunk.toString().trim();
                        chunks.add(new TextChunk(chunkIndex++, chunkStr, chunkStr.length(), countWords(chunkStr)));
                        currentChunk.setLength(0);
                    }
                    if (currentChunk.length() > 0) {
                        currentChunk.append(" ");
                    }
                    currentChunk.append(sentence);
                }
            } else {
                // If appending this paragraph exceeds targetChunkSize, finalize current chunk
                if (currentChunk.length() + trimmedPara.length() + 2 > targetChunkSize && currentChunk.length() > 0) {
                    String chunkStr = currentChunk.toString().trim();
                    chunks.add(new TextChunk(chunkIndex++, chunkStr, chunkStr.length(), countWords(chunkStr)));
                    currentChunk.setLength(0);
                }

                if (currentChunk.length() > 0) {
                    currentChunk.append("\n\n");
                }
                currentChunk.append(trimmedPara);
            }
        }

        // Flush remaining text
        if (currentChunk.length() > 0) {
            String chunkStr = currentChunk.toString().trim();
            if (!chunkStr.isEmpty()) {
                chunks.add(new TextChunk(chunkIndex, chunkStr, chunkStr.length(), countWords(chunkStr)));
            }
        }

        return chunks;
    }

    /**
     * Splits a long block of text into sentences based on punctuation.
     */
    private List<String> splitIntoSentences(String text) {
        // Lookbehind for sentence-ending punctuation followed by whitespace
        String[] rawSentences = text.split("(?<=[.!?])\\s+");
        List<String> sentences = new ArrayList<>();
        for (String s : rawSentences) {
            String trimmed = s.trim();
            if (!trimmed.isEmpty()) {
                sentences.add(trimmed);
            }
        }
        return sentences.isEmpty() ? List.of(text) : sentences;
    }

    /**
     * Counts the total number of words in a text block.
     */
    public int countWords(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        String trimmed = text.trim();
        String[] words = trimmed.split("\\s+");
        return words.length;
    }
}

