package com.campushub.backend.service.ai;

import com.campushub.backend.service.ai.embedding.EmbeddingService;
import com.campushub.backend.service.ai.embedding.FallbackEmbeddingProvider;
import com.campushub.backend.service.ai.embedding.GeminiEmbeddingProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class EmbeddingServiceTest {

    private GeminiEmbeddingProvider geminiProvider;
    private FallbackEmbeddingProvider fallbackProvider;
    private EmbeddingService embeddingService;

    @BeforeEach
    void setUp() {
        geminiProvider = Mockito.mock(GeminiEmbeddingProvider.class);
        fallbackProvider = new FallbackEmbeddingProvider();
        embeddingService = new EmbeddingService(geminiProvider, fallbackProvider);
    }

    @Test
    @DisplayName("Fallback embedding provider generates 768-dimensional normalized vector")
    void testFallbackEmbeddingDimensionsAndNormalization() {
        float[] vector = fallbackProvider.generateEmbedding("Introduction to Computer Networks and TCP sliding window protocol");
        assertNotNull(vector);
        assertEquals(768, vector.length);

        // Verify L2 unit normalization: sum of squares ≈ 1.0
        double sumSquares = 0.0;
        for (float v : vector) {
            sumSquares += v * v;
        }
        assertEquals(1.0, sumSquares, 0.001, "Vector must be L2 normalized");
    }

    @Test
    @DisplayName("Identical texts produce cosine similarity of 1.0 with deterministic fallback")
    void testCosineSimilarityIdentical() {
        float[] v1 = fallbackProvider.generateEmbedding("Software Architecture and Design Patterns");
        float[] v2 = fallbackProvider.generateEmbedding("Software Architecture and Design Patterns");

        double similarity = embeddingService.calculateCosineSimilarity(v1, v2);
        assertEquals(1.0, similarity, 0.0001);
    }

    @Test
    @DisplayName("Semantically related texts produce higher similarity than unrelated texts")
    void testCosineSimilarityRelated() {
        float[] doc1 = fallbackProvider.generateEmbedding("Database indexing B-Tree query optimization PostgreSQL");
        float[] doc2 = fallbackProvider.generateEmbedding("PostgreSQL relational database queries and index scans");
        float[] unrelated = fallbackProvider.generateEmbedding("Photosynthesis light reactions chloroplasts plant biology");

        double simRelated = embeddingService.calculateCosineSimilarity(doc1, doc2);
        double simUnrelated = embeddingService.calculateCosineSimilarity(doc1, unrelated);

        assertTrue(simRelated > simUnrelated, "Related database texts must score higher than biology text");
    }

    @Test
    @DisplayName("toPgVectorString serializes float array into valid PostgreSQL pgvector literal")
    void testToPgVectorString() {
        float[] vector = new float[]{0.123456f, -0.654321f, 0.0f};
        String pgVector = embeddingService.toPgVectorString(vector);
        assertEquals("[0.123456,-0.654321,0.000000]", pgVector);
    }

    @Test
    @DisplayName("Delegates to Gemini provider when configured and valid")
    void testGeminiDelegation() {
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getDimensions()).thenReturn(768);
        float[] mockGeminiVector = new float[768];
        mockGeminiVector[0] = 0.99f;
        when(geminiProvider.generateEmbedding(anyString())).thenReturn(mockGeminiVector);

        float[] result = embeddingService.generateEmbedding("Operating Systems Virtual Memory");
        assertNotNull(result);
        assertEquals(0.99f, result[0]);
    }
}

