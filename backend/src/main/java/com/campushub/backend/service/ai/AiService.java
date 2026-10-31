package com.campushub.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Unified AI service orchestrator for CampusHub.
 * <p>
 * Selects the active configured {@link AiProvider}, delegates analysis,
 * and validates/sanitizes AI output before persistence.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final String preferredProviderName;
    private final Map<String, AiProvider> providerMap;
    private final FallbackAiProvider fallbackAiProvider;

    public AiService(
            @Value("${ai.provider:gemini}") String preferredProviderName,
            List<AiProvider> providers,
            FallbackAiProvider fallbackAiProvider
    ) {
        this.preferredProviderName = preferredProviderName != null ? preferredProviderName.trim().toLowerCase() : "gemini";
        this.providerMap = new HashMap<>();
        for (AiProvider p : providers) {
            this.providerMap.put(p.getProviderName().toLowerCase(), p);
        }
        this.fallbackAiProvider = fallbackAiProvider;

        log.info("Initialized AiService. Preferred provider: '{}'. Registered providers: {}",
                this.preferredProviderName, this.providerMap.keySet());
    }

    /**
     * Resolves the active AI provider, falling back to local heuristic provider if the preferred one is unconfigured.
     */
    public AiProvider getActiveProvider() {
        AiProvider preferred = providerMap.get(preferredProviderName);
        if (preferred != null && preferred.isConfigured()) {
            return preferred;
        }

        // If preferred is unconfigured, check if Gemini is available
        AiProvider gemini = providerMap.get("gemini");
        if (gemini != null && gemini.isConfigured()) {
            return gemini;
        }

        log.info("No external AI provider configured with valid API key. Using local fallback provider.");
        return fallbackAiProvider;
    }

    /**
     * Analyzes preprocessed document text to produce a validated summary and tags.
     */
    public ResourceAiResult generateSummaryAndTags(CleanedDocument cleanedDoc, String title, String courseContext) {
        if (cleanedDoc == null || !cleanedDoc.hasSufficientContent() || cleanedDoc.cleanedText().isBlank()) {
            log.warn("Cannot generate AI summary: cleaned document has insufficient content.");
            return ResourceAiResult.empty();
        }

        // Limit prompt input text to MAX 12,000 characters (~2,500 tokens) to preserve free tier quota
        String inputText = cleanedDoc.cleanedText();
        if (inputText.length() > 12000) {
            log.info("Document text exceeds 12,000 chars ({} chars). Using first 12,000 chars for summary.", inputText.length());
            inputText = inputText.substring(0, 12000);
        }

        AiProvider provider = getActiveProvider();
        log.info("Generating summary and tags using provider: '{}'", provider.getProviderName());

        ResourceAiResult rawResult = provider.analyze(inputText, title, courseContext);

        // If external provider fails or returns empty, try fallback
        if ((rawResult == null || !rawResult.hasContent()) && provider != fallbackAiProvider) {
            log.warn("Provider '{}' returned empty result. Invoking fallback provider.", provider.getProviderName());
            rawResult = fallbackAiProvider.analyze(inputText, title, courseContext);
        }

        return validateAndSanitize(rawResult);
    }

    /**
     * Defensively validates and normalizes model output.
     */
    public ResourceAiResult validateAndSanitize(ResourceAiResult raw) {
        if (raw == null) {
            return ResourceAiResult.empty();
        }

        // 1. Sanitize summary
        String summary = raw.summary() != null ? raw.summary().trim() : "";
        if (summary.length() > 1000) {
            summary = summary.substring(0, 1000).trim();
        }

        // 2. Normalize and deduplicate tags
        Set<String> normalizedTags = new LinkedHashSet<>();
        if (raw.tags() != null) {
            for (String tag : raw.tags()) {
                String clean = sanitizeTag(tag);
                if (clean != null && !clean.isBlank() && clean.length() >= 2 && clean.length() <= 35) {
                    normalizedTags.add(clean);
                }
                if (normalizedTags.size() >= 6) {
                    break;
                }
            }
        }

        return new ResourceAiResult(summary, new ArrayList<>(normalizedTags));
    }

    private String sanitizeTag(String tag) {
        if (tag == null) return null;
        // Strip bullet points, leading numbers, quotes, or trailing punctuation
        String cleaned = tag.replaceAll("^[-*#0-9.\\s]+", "")
                            .replaceAll("[\"'\\[\\]{}]", "")
                            .replaceAll("[.,;:]+$", "")
                            .trim();
        return cleaned;
    }
}

