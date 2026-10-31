package com.campushub.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic fallback provider used when external LLMs are unconfigured, rate-limited, or offline.
 * <p>
 * Extracts key sentences and capitalized technical terms directly from the text without external calls.
 */
@Component
public class FallbackAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(FallbackAiProvider.class);

    private static final Pattern TECHNICAL_TERM_PATTERN = Pattern.compile(
            "\\b[A-Z][a-zA-Z0-9-]{2,}(?:\\s+[A-Z][a-zA-Z0-9-]+)?\\b"
    );

    private static final Set<String> STOP_WORDS = Set.of(
            "THE", "THIS", "THAT", "WITH", "FROM", "HAVE", "SOME", "WHEN", "WHICH", "THESE", "THOSE"
    );

    @Override
    public String getProviderName() {
        return "fallback";
    }

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public ResourceAiResult analyze(String documentText, String resourceTitle, String courseContext) {
        log.info("Running local deterministic fallback analysis for '{}'...", resourceTitle);

        if (documentText == null || documentText.isBlank()) {
            return ResourceAiResult.empty();
        }

        // 1. Extractive summary: Pick the first 2-3 non-trivial sentences
        String[] rawSentences = documentText.split("(?<=[.!?])\\s+");
        List<String> chosenSentences = new ArrayList<>();
        for (String s : rawSentences) {
            String trimmed = s.trim();
            if (trimmed.length() >= 35 && !trimmed.startsWith("Chapter") && !trimmed.startsWith("Table")) {
                chosenSentences.add(trimmed);
                if (chosenSentences.size() >= 2) {
                    break;
                }
            }
        }

        String summary;
        if (!chosenSentences.isEmpty()) {
            summary = String.join(" ", chosenSentences);
        } else {
            summary = "Academic resource covering " + (resourceTitle != null ? resourceTitle : "course topics") + ".";
        }

        // 2. Extract technical terms / tags
        Set<String> uniqueTags = new LinkedHashSet<>();
        if (resourceTitle != null && !resourceTitle.isBlank()) {
            uniqueTags.add(resourceTitle.replaceAll("(?i)\\b(pack|final|notes|lecture|exam|tute)\\b", "").trim());
        }

        Matcher matcher = TECHNICAL_TERM_PATTERN.matcher(documentText);
        while (matcher.find() && uniqueTags.size() < 5) {
            String term = matcher.group().trim();
            if (term.length() >= 3 && term.length() <= 30 && !STOP_WORDS.contains(term.toUpperCase())) {
                uniqueTags.add(term);
            }
        }

        List<String> tags = uniqueTags.stream().filter(t -> !t.isBlank()).limit(5).toList();

        return new ResourceAiResult(summary, tags);
    }
}

