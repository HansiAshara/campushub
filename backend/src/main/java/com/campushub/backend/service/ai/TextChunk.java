package com.campushub.backend.service.ai;

/**
 * Represents a single logical chunk of text split along paragraph/sentence boundaries
 * for safe, quota-conserving LLM analysis.
 *
 * @param index          Zero-based sequence index of the chunk.
 * @param text           The clean text content of this chunk.
 * @param characterCount Total character length of this chunk.
 * @param wordCount      Total word count of this chunk.
 */
public record TextChunk(
        int index,
        String text,
        int characterCount,
        int wordCount
) {
}

