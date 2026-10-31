package com.campushub.backend.service.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TextPreprocessorServiceTest {

    private TextPreprocessorService preprocessorService;

    @BeforeEach
    void setUp() {
        preprocessorService = new TextPreprocessorService();
    }

    @Test
    @DisplayName("Should normalize unicode spaces, carriage returns, and control characters")
    void testSanitizeControlAndUnicodeSpaces() {
        // Contains NBSP (\u00A0), zero-width space (\u200B), null byte (\x00), and CRLF
        String raw = "Introduction\u00A0to\u200B Algorithms.\0\r\n\r\nSorting\tand\tSearching.";
        String cleaned = preprocessorService.cleanText(raw);

        assertFalse(cleaned.contains("\r"));
        assertFalse(cleaned.contains("\0"));
        assertFalse(cleaned.contains("\u00A0"));
        assertTrue(cleaned.contains("Introduction to Algorithms."));
        assertTrue(cleaned.contains("Sorting and Searching."));
    }

    @Test
    @DisplayName("Should strip extraction artifacts such as page numbers and decorative lines")
    void testStripPageNumbersAndSeparators() {
        String raw = """
                Lecture 01: Computer Architecture
                ---------------------------------
                Page 1 of 42
                
                The central processing unit executes machine instructions.
                
                - 2 -
                
                Memory hierarchy consists of registers, cache, RAM, and disk.
                =================================
                42
                """;

        String cleaned = preprocessorService.cleanText(raw);

        assertFalse(cleaned.contains("Page 1 of 42"));
        assertFalse(cleaned.contains("- 2 -"));
        assertFalse(cleaned.contains("---------------------------------"));
        assertFalse(cleaned.contains("================================="));
        assertTrue(cleaned.contains("The central processing unit executes machine instructions."));
        assertTrue(cleaned.contains("Memory hierarchy consists of registers, cache, RAM, and disk."));
    }

    @Test
    @DisplayName("Should identify insufficient content when text is too short or empty")
    void testInsufficientContentDetection() {
        ExtractedDocument shortDoc = ExtractedDocument.success("Too short", 1);
        CleanedDocument cleaned = preprocessorService.preprocess(shortDoc);

        assertNotNull(cleaned);
        assertFalse(cleaned.hasSufficientContent());
        assertTrue(cleaned.statusMessage().contains("insufficient"));
    }

    @Test
    @DisplayName("Should successfully chunk long text respecting paragraph and sentence boundaries")
    void testChunkingLongText() {
        StringBuilder builder = new StringBuilder();
        for (int i = 1; i <= 20; i++) {
            builder.append("Paragraph ").append(i).append(": ")
                   .append("This is an in-depth academic paragraph discussing key concepts in distributed systems. ")
                   .append("Consensus algorithms like Raft and Paxos ensure state machine replication across nodes. ")
                   .append("Byzantine fault tolerance handles arbitrary failures.\n\n");
        }

        String fullText = builder.toString();
        // Target chunk size small enough to trigger multiple chunks
        List<TextChunk> chunks = preprocessorService.chunkText(fullText, 800);

        assertNotNull(chunks);
        assertTrue(chunks.size() > 1, "Should split into multiple chunks");

        for (int i = 0; i < chunks.size(); i++) {
            TextChunk chunk = chunks.get(i);
            assertEquals(i, chunk.index());
            assertFalse(chunk.text().isBlank());
            assertTrue(chunk.characterCount() > 0);
            assertTrue(chunk.wordCount() > 0);
            // Verify it doesn't break in the middle of a word
            assertFalse(chunk.text().startsWith(" "));
            assertFalse(chunk.text().endsWith(" "));
        }
    }

    @Test
    @DisplayName("Should handle single chunk for short meaningful text")
    void testSingleChunkForShortText() {
        String academicNote = "This lecture note covers TCP congestion control, sliding window protocol, and slow-start algorithm.";
        ExtractedDocument doc = ExtractedDocument.success(academicNote, 1);

        CleanedDocument cleaned = preprocessorService.preprocess(doc);

        assertTrue(cleaned.hasSufficientContent());
        assertEquals(1, cleaned.chunks().size());
        assertEquals(0, cleaned.chunks().get(0).index());
        assertEquals(academicNote, cleaned.chunks().get(0).text());
    }
}

