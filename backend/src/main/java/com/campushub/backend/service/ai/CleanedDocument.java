package com.campushub.backend.service.ai;

import java.util.List;

/**
 * Encapsulates the deterministic result of cleaning, normalizing, and chunking
 * extracted academic resource text prior to passing to an AI provider.
 *
 * @param cleanedText            The normalized, sanitized full text.
 * @param originalCharacterCount Character count before cleaning.
 * @param cleanedCharacterCount  Character count after cleaning and artifact removal.
 * @param wordCount              Word count of the cleaned text.
 * @param pageCount              Page or slide count from the source document.
 * @param chunks                 Intelligently split chunks respecting natural paragraph boundaries.
 * @param hasSufficientContent   Whether the text meets the minimum threshold for meaningful AI analysis.
 * @param statusMessage          Diagnostic or warning message regarding document quality.
 * @param aiResult               Optional preview AI analysis result (summary + tags).
 */
public record CleanedDocument(
        String cleanedText,
        int originalCharacterCount,
        int cleanedCharacterCount,
        int wordCount,
        int pageCount,
        List<TextChunk> chunks,
        boolean hasSufficientContent,
        String statusMessage,
        ResourceAiResult aiResult
) {
    public static CleanedDocument empty(String reason) {
        return new CleanedDocument("", 0, 0, 0, 0, List.of(), false, reason, ResourceAiResult.empty());
    }

    public CleanedDocument(
            String cleanedText,
            int originalCharacterCount,
            int cleanedCharacterCount,
            int wordCount,
            int pageCount,
            List<TextChunk> chunks,
            boolean hasSufficientContent,
            String statusMessage
    ) {
        this(cleanedText, originalCharacterCount, cleanedCharacterCount, wordCount, pageCount, chunks, hasSufficientContent, statusMessage, ResourceAiResult.empty());
    }
}
