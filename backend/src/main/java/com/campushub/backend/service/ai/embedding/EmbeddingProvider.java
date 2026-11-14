package com.campushub.backend.service.ai.embedding;

/**
 * Strategy interface for generating dense semantic vector embeddings from text.
 */
public interface EmbeddingProvider {

    /**
     * Unique identifier for this provider (e.g., "gemini", "fallback").
     */
    String getProviderName();

    /**
     * Checks if this provider is properly configured with required credentials.
     */
    boolean isConfigured();

    /**
     * Generates a normalized vector embedding for the input text.
     *
     * @param text document or query text to embed
     * @return dense float array of embeddings, or null if generation fails
     */
    float[] generateEmbedding(String text);

    /**
     * Number of vector dimensions produced by this provider (e.g., 768).
     */
    int getDimensions();
}

