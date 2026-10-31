package com.campushub.backend.service.ai;

import java.util.List;

/**
 * Strongly typed representation of structured AI analysis output for an academic resource.
 *
 * @param summary A concise, grounded academic summary (typically 2-4 sentences).
 * @param tags    A list of normalized, meaningful academic topics/keywords.
 */
public record ResourceAiResult(
        String summary,
        List<String> tags
) {
    public static ResourceAiResult empty() {
        return new ResourceAiResult("", List.of());
    }

    public boolean hasContent() {
        return summary != null && !summary.isBlank();
    }
}

