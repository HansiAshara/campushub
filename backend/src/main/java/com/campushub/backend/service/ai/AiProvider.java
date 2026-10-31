package com.campushub.backend.service.ai;

/**
 * Provider-independent abstraction for AI capabilities in CampusHub.
 * <p>
 * Decouples core application logic from specific AI vendors (Google Gemini, Groq, Ollama).
 * Allows switching providers via configuration without modifying business logic.
 */
public interface AiProvider {

    /**
     * Unique identifier for this provider (e.g. "gemini", "groq", "ollama", "noop").
     */
    String getProviderName();

    /**
     * Checks if this provider is properly configured (e.g., API key present or local host reachable).
     */
    boolean isConfigured();

    /**
     * Analyzes extracted document text to generate a concise summary and normalized topic tags.
     *
     * @param documentText  Cleaned text content of the academic resource.
     * @param resourceTitle User-provided title of the resource.
     * @param courseContext Academic context (e.g., module code, name).
     * @return Validated structured result containing summary and tags.
     */
    ResourceAiResult analyze(String documentText, String resourceTitle, String courseContext);
}

