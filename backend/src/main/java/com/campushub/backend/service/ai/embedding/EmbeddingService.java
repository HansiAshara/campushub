package com.campushub.backend.service.ai.embedding;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Locale;

/**
 * High-level service orchestrating document vectorization, vector serialization,
 * and cosine similarity calculations.
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final GeminiEmbeddingProvider geminiProvider;
    private final FallbackEmbeddingProvider fallbackProvider;

    @Autowired
    public EmbeddingService(GeminiEmbeddingProvider geminiProvider,
                            FallbackEmbeddingProvider fallbackProvider) {
        this.geminiProvider = geminiProvider;
        this.fallbackProvider = fallbackProvider;
    }

    /**
     * Generates a dense 768-dimensional normalized embedding vector.
     * Uses Gemini text-embedding-004 when available; gracefully falls back to deterministic local projection.
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return fallbackProvider.generateEmbedding("");
        }

        if (geminiProvider != null && geminiProvider.isConfigured()) {
            float[] geminiVec = geminiProvider.generateEmbedding(text);
            if (geminiVec != null && geminiVec.length == geminiProvider.getDimensions()) {
                return geminiVec;
            }
            log.warn("Gemini embedding failed or returned null; using deterministic fallback provider.");
        }

        return fallbackProvider.generateEmbedding(text);
    }

    /**
     * Serializes a float array into the standard PostgreSQL pgvector textual format:
     * e.g., "[0.012345,-0.045678,0.123456,...]"
     */
    public String toPgVectorString(float[] vector) {
        if (vector == null || vector.length == 0) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder(vector.length * 9 + 2);
        sb.append('[');
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(String.format(Locale.US, "%.6f", vector[i]));
        }
        sb.append(']');
        return sb.toString();
    }

    /**
     * Constructs a standardized text representation for document embedding.
     * Combines Title, AI Summary, Normalized Tags, and a Clean Content Excerpt.
     */
    public String buildEmbeddingText(String title, String summary, Collection<String> tags, String excerpt) {
        StringBuilder sb = new StringBuilder();
        if (title != null && !title.isBlank()) {
            sb.append("Title: ").append(title.trim()).append("\n");
        }
        if (summary != null && !summary.isBlank()) {
            sb.append("Summary: ").append(summary.trim()).append("\n");
        }
        if (tags != null && !tags.isEmpty()) {
            sb.append("Topics: ").append(String.join(", ", tags)).append("\n");
        }
        if (excerpt != null && !excerpt.isBlank()) {
            String cleanExcerpt = excerpt.trim();
            if (cleanExcerpt.length() > 600) {
                cleanExcerpt = cleanExcerpt.substring(0, 600);
            }
            sb.append("Content: ").append(cleanExcerpt);
        }
        return sb.toString();
    }

    /**
     * Computes the cosine similarity between two vectors:
     * similarity = (A · B) / (||A|| * ||B||)
     * Values range from -1.0 to +1.0 (clamped to [0.0, 1.0] for semantic scoring).
     */
    public double calculateCosineSimilarity(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length || a.length == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA < 1e-9 || normB < 1e-9) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, similarity));
    }
}

