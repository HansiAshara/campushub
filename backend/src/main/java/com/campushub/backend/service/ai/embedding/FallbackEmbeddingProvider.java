package com.campushub.backend.service.ai.embedding;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Deterministic, offline fallback embedding provider.
 * Uses term-hash random projection into 768 dimensions with L2 unit normalization.
 * <p>
 * Ensures zero-cost reliability: if the external Gemini API is unreachable or has no key,
 * semantic queries, tests, and duplicate checks continue functioning offline.
 */
@Component
public class FallbackEmbeddingProvider implements EmbeddingProvider {

    private static final Logger log = LoggerFactory.getLogger(FallbackEmbeddingProvider.class);
    public static final int VECTOR_DIMENSIONS = 768;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do",
            "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
            "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it",
            "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
            "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
            "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
            "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when",
            "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself"
    ));

    @Override
    public String getProviderName() {
        return "fallback";
    }

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public int getDimensions() {
        return VECTOR_DIMENSIONS;
    }

    @Override
    public float[] generateEmbedding(String text) {
        float[] vector = new float[VECTOR_DIMENSIONS];
        if (text == null || text.isBlank()) {
            return vector;
        }

        String[] tokens = text.toLowerCase().split("[^a-zA-Z0-9]+");

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");

            int validTokenCount = 0;
            for (String token : tokens) {
                if (token.length() < 2 || STOP_WORDS.contains(token)) {
                    continue;
                }
                validTokenCount++;

                // Project each token across multiple dimensions using hash seeds
                byte[] hash = md.digest(token.getBytes(StandardCharsets.UTF_8));
                md.reset();

                for (int seed = 0; seed < 4; seed++) {
                    int offset = seed * 4;
                    int h = ((hash[offset] & 0xFF) << 24)
                            | ((hash[offset + 1] & 0xFF) << 16)
                            | ((hash[offset + 2] & 0xFF) << 8)
                            | (hash[offset + 3] & 0xFF);

                    int index = Math.abs(h) % VECTOR_DIMENSIONS;
                    float sign = ((h >>> 31) == 0) ? 1.0f : -1.0f;
                    vector[index] += sign * (1.0f / (float) Math.sqrt(validTokenCount));
                }
            }

            // Fallback for extremely sparse or empty tokens
            if (validTokenCount == 0) {
                vector[0] = 1.0f;
                return vector;
            }

            // L2 normalize vector so dot product equals cosine similarity
            double sumSquares = 0.0;
            for (float v : vector) {
                sumSquares += v * v;
            }

            double norm = Math.sqrt(sumSquares);
            if (norm > 1e-9) {
                for (int i = 0; i < vector.length; i++) {
                    vector[i] = (float) (vector[i] / norm);
                }
            }

        } catch (Exception e) {
            log.warn("Fallback vector projection error: {}", e.getMessage());
        }

        return vector;
    }
}

