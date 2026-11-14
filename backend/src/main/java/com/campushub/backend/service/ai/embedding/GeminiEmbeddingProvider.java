package com.campushub.backend.service.ai.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Generates 768-dimensional dense vector embeddings using Google's text-embedding-004 model via REST.
 */
@Component
public class GeminiEmbeddingProvider implements EmbeddingProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiEmbeddingProvider.class);
    private static final String EMBED_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:embedContent?key=%s";
    public static final int VECTOR_DIMENSIONS = 768;

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiEmbeddingProvider(
            @Value("${ai.gemini.api-key:${GEMINI_API_KEY:}}") String apiKey,
            @Value("${ai.gemini.embedding-model:text-embedding-004}") String model
    ) {
        this(apiKey, model, new ObjectMapper());
    }

    public GeminiEmbeddingProvider(String apiKey, String model, ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null && !model.isBlank() ? model.trim() : "text-embedding-004";
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
    public int getDimensions() {
        return VECTOR_DIMENSIONS;
    }

    @Override
    public float[] generateEmbedding(String text) {
        if (!isConfigured()) {
            log.warn("Gemini API key is not configured; cannot call text-embedding-004.");
            return null;
        }

        if (text == null || text.isBlank()) {
            return null;
        }

        // Gemini text-embedding-004 max input is ~2048 tokens; truncate safely if needed
        String safeText = text.length() > 6000 ? text.substring(0, 6000) : text;

        try {
            String url = String.format(EMBED_URL_TEMPLATE, model, apiKey);

            Map<String, Object> requestBody = Map.of(
                    "model", "models/" + model,
                    "content", Map.of(
                            "parts", List.of(Map.of("text", safeText))
                    )
            );

            String responseBody = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                log.warn("Received empty response from Gemini embedding API.");
                return null;
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode valuesNode = root.path("embedding").path("values");

            if (!valuesNode.isArray() || valuesNode.isEmpty()) {
                log.warn("Gemini embedding response missing values array: {}", responseBody);
                return null;
            }

            float[] values = new float[valuesNode.size()];
            for (int i = 0; i < valuesNode.size(); i++) {
                values[i] = (float) valuesNode.get(i).asDouble();
            }

            log.debug("Successfully generated {}d embedding via Gemini {}", values.length, model);
            return values;

        } catch (Exception e) {
            log.error("Failed to generate embedding with Gemini: {}", e.getMessage());
            return null;
        }
    }
}

