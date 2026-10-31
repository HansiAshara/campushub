package com.campushub.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implementation of {@link AiProvider} using Google Gemini free-tier REST API (e.g. gemini-1.5-flash).
 * <p>
 * Uses Spring {@link RestClient} for zero-dependency HTTP communication.
 * Enforces structured JSON output and low temperature for deterministic, grounded results.
 */
@Component
public class GeminiAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiAiProvider(
            @Value("${ai.gemini.api-key:${GEMINI_API_KEY:}}") String apiKey,
            @Value("${ai.gemini.model:gemini-1.5-flash}") String model
    ) {
        this(apiKey, model, new ObjectMapper());
    }

    public GeminiAiProvider(
            String apiKey,
            String model,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null && !model.isBlank() ? model.trim() : "gemini-1.5-flash";
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    public ResourceAiResult analyze(String documentText, String resourceTitle, String courseContext) {
        if (!isConfigured()) {
            log.warn("Gemini API key is not configured. Skipping Gemini AI analysis.");
            return ResourceAiResult.empty();
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        String userPrompt = AiPromptBuilder.buildAnalysisPrompt(documentText, resourceTitle, courseContext);

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", AiPromptBuilder.SYSTEM_INSTRUCTION))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", userPrompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        try {
            log.info("Sending analysis request to Gemini model '{}'...", model);
            String responseJson = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseGeminiResponse(responseJson);
        } catch (Exception e) {
            log.error("Gemini API request failed: {}", e.getMessage());
            return ResourceAiResult.empty();
        }
    }

    /**
     * Parses the Gemini generateContent response extracting the structured JSON.
     */
    public ResourceAiResult parseGeminiResponse(String responseJson) {
        if (responseJson == null || responseJson.isBlank()) {
            return ResourceAiResult.empty();
        }

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                log.warn("Gemini returned no candidates in response.");
                return ResourceAiResult.empty();
            }

            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            if (textNode.isMissingNode()) {
                return ResourceAiResult.empty();
            }

            String contentText = textNode.asText().trim();
            // In case the response is wrapped in markdown code fence (```json ... ```)
            if (contentText.startsWith("```")) {
                contentText = contentText.replaceAll("^```json\\s*", "").replaceAll("^```\\s*", "").replaceAll("```$", "").trim();
            }

            JsonNode parsed = objectMapper.readTree(contentText);
            String summary = parsed.path("summary").asText("").trim();

            List<String> tags = new ArrayList<>();
            JsonNode tagsNode = parsed.path("tags");
            if (tagsNode.isArray()) {
                for (JsonNode t : tagsNode) {
                    String tag = t.asText("").trim();
                    if (!tag.isBlank()) {
                        tags.add(tag);
                    }
                }
            }

            log.info("Gemini analysis successful: summary ({} chars), {} tags.", summary.length(), tags.size());
            return new ResourceAiResult(summary, tags);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response payload: {}", e.getMessage());
            return ResourceAiResult.empty();
        }
    }
}

