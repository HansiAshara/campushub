package com.campushub.backend.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeminiAiProviderTest {

    private GeminiAiProvider geminiProvider;

    @BeforeEach
    void setUp() {
        geminiProvider = new GeminiAiProvider("", "gemini-1.5-flash", new ObjectMapper());
    }

    @Test
    @DisplayName("Should parse valid Gemini structured JSON response correctly")
    void testParseValidGeminiResponse() {
        String responseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"summary\\": \\"This tutorial covers TCP congestion control, sliding windows, and slow start.\\", \\"tags\\": [\\"TCP\\", \\"Congestion Control\\", \\"Slow Start\\"]}"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        ResourceAiResult result = geminiProvider.parseGeminiResponse(responseJson);

        assertNotNull(result);
        assertTrue(result.hasContent());
        assertTrue(result.summary().contains("TCP congestion control"));
        assertEquals(3, result.tags().size());
        assertTrue(result.tags().contains("Slow Start"));
    }

    @Test
    @DisplayName("Should parse Gemini response even if wrapped in markdown code fence")
    void testParseMarkdownWrappedResponse() {
        String responseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "```json\\n{\\"summary\\": \\"Database normalization notes.\\", \\"tags\\": [\\"Normalization\\", \\"3NF\\", \\"BCNF\\"]}\\n```"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        ResourceAiResult result = geminiProvider.parseGeminiResponse(responseJson);

        assertNotNull(result);
        assertEquals("Database normalization notes.", result.summary());
        assertEquals(3, result.tags().size());
        assertTrue(result.tags().contains("BCNF"));
    }

    @Test
    @DisplayName("Should handle empty or malformed Gemini response without throwing exceptions")
    void testParseEmptyOrMalformedResponse() {
        ResourceAiResult nullResult = geminiProvider.parseGeminiResponse(null);
        assertNotNull(nullResult);
        assertFalse(nullResult.hasContent());

        ResourceAiResult malformedResult = geminiProvider.parseGeminiResponse("{ invalid json }");
        assertNotNull(malformedResult);
        assertFalse(malformedResult.hasContent());
    }
}

