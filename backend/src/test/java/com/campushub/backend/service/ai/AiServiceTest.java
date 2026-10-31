package com.campushub.backend.service.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiServiceTest {

    private AiService aiService;
    private FallbackAiProvider fallbackAiProvider;

    @BeforeEach
    void setUp() {
        fallbackAiProvider = new FallbackAiProvider();
        aiService = new AiService("fallback", List.of(fallbackAiProvider), fallbackAiProvider);
    }

    @Test
    @DisplayName("Should sanitize and deduplicate tags properly")
    void testValidateAndSanitizeTags() {
        ResourceAiResult raw = new ResourceAiResult(
                "  Solid state physics overview.  ",
                List.of("- Semiconductor", "Semiconductor", "\"Band Gap\"", "1. Transistor;", "A", "VeryVeryVeryLongTagNameExceedingThirtyFiveCharactersLimit")
        );

        ResourceAiResult sanitized = aiService.validateAndSanitize(raw);

        assertEquals("Solid state physics overview.", sanitized.summary());
        // "Semiconductor" deduplicated, quotes stripped, punctuation stripped, "A" dropped (<2 chars), long tag dropped (>35 chars)
        assertEquals(3, sanitized.tags().size());
        assertTrue(sanitized.tags().contains("Semiconductor"));
        assertTrue(sanitized.tags().contains("Band Gap"));
        assertTrue(sanitized.tags().contains("Transistor"));
    }

    @Test
    @DisplayName("Should invoke fallback provider when no API key is set")
    void testFallbackProviderAnalysis() {
        String content = "Computer Networks lecture. TCP uses three-way handshake for connection establishment. Congestion window controls rate.";
        CleanedDocument doc = new CleanedDocument(content, content.length(), content.length(), 14, 1, List.of(), true, "ok");

        ResourceAiResult result = aiService.generateSummaryAndTags(doc, "TCP Lecture", "CS302");

        assertNotNull(result);
        assertTrue(result.hasContent());
        assertFalse(result.tags().isEmpty());
    }
}

