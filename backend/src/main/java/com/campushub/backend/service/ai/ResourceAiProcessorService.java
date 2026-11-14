package com.campushub.backend.service.ai;

import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.Tag;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.service.TagService;
import com.campushub.backend.service.ai.embedding.EmbeddingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Handles asynchronous background execution of document text extraction,
 * preprocessing, AI summarization, normalized tagging, and pgvector embeddings.
 */
@Service
public class ResourceAiProcessorService {

    private static final Logger log = LoggerFactory.getLogger(ResourceAiProcessorService.class);

    private final ResourceRepository resourceRepository;
    private final DocumentTextExtractorService documentTextExtractorService;
    private final TextPreprocessorService textPreprocessorService;
    private final AiService aiService;
    private final TagService tagService;
    private final EmbeddingService embeddingService;

    public ResourceAiProcessorService(
            ResourceRepository resourceRepository,
            DocumentTextExtractorService documentTextExtractorService,
            TextPreprocessorService textPreprocessorService,
            AiService aiService,
            TagService tagService,
            EmbeddingService embeddingService
    ) {
        this.resourceRepository = resourceRepository;
        this.documentTextExtractorService = documentTextExtractorService;
        this.textPreprocessorService = textPreprocessorService;
        this.aiService = aiService;
        this.tagService = tagService;
        this.embeddingService = embeddingService;
    }

    /**
     * Executes the AI pipeline asynchronously in a background worker thread.
     */
    @Async("aiTaskExecutor")
    @Transactional
    public void processResourceAsync(Long resourceId, String fileName, byte[] fileBytes) {
        log.info("Starting background AI processing for resource ID {} ('{}')...", resourceId, fileName);

        Resource resource = resourceRepository.findById(resourceId).orElse(null);
        if (resource == null) {
            log.error("Resource ID {} not found for background AI processing.", resourceId);
            return;
        }

        try {
            resource.setAiStatus(Resource.AiStatus.PROCESSING);
            resourceRepository.save(resource);

            // 1. Text Extraction
            ExtractedDocument extracted = documentTextExtractorService.extract(fileName, fileBytes);

            if (!extracted.hasExtractableText()) {
                String reason = extracted.errorMessage() != null ? extracted.errorMessage() : "No extractable text found";
                log.info("File '{}' contains no extractable text ({}). Skipping AI summarization.", fileName, reason);
                resource.setAiStatus(Resource.AiStatus.SKIPPED);
                resource.setSummary("AI summarization skipped: " + reason);
                resourceRepository.save(resource);
                return;
            }

            // 2. Preprocessing & Sanitization
            CleanedDocument cleaned = textPreprocessorService.preprocess(extracted);

            if (!cleaned.hasSufficientContent()) {
                log.info("Document '{}' has insufficient extracted text ({}) to generate meaningful AI summary. Skipping.",
                        fileName, cleaned.statusMessage());
                resource.setAiStatus(Resource.AiStatus.SKIPPED);
                resource.setSummary("AI summarization skipped: " + cleaned.statusMessage());
                resourceRepository.save(resource);
                return;
            }

            // 3. AI Analysis (Summary + Tags)
            String courseContext = resource.getCourse() != null
                    ? resource.getCourse().getCode() + " - " + resource.getCourse().getName()
                    : "";

            ResourceAiResult aiResult = aiService.generateSummaryAndTags(cleaned, resource.getTitle(), courseContext);

            if (aiResult != null && aiResult.hasContent()) {
                // 4. Resolve normalized tags
                Set<Tag> tags = tagService.getOrCreateTags(aiResult.tags());

                resource.setSummary(aiResult.summary());
                resource.setTags(tags);
                resource.setAiStatus(Resource.AiStatus.COMPLETED);
                resourceRepository.save(resource);

                log.info("Background AI processing completed for resource ID {}: generated summary and {} tags.",
                        resourceId, tags.size());

                // 5. Phase 2: Vector Embedding & Duplicate Analysis
                try {
                    String excerpt = cleaned.chunks().isEmpty() ? "" : cleaned.chunks().get(0).text();
                    String embeddingInput = embeddingService.buildEmbeddingText(
                            resource.getTitle(),
                            aiResult.summary(),
                            aiResult.tags(),
                            excerpt
                    );

                    float[] embedding = embeddingService.generateEmbedding(embeddingInput);
                    if (embedding != null && embedding.length > 0) {
                        String vectorStr = embeddingService.toPgVectorString(embedding);
                        resourceRepository.updateEmbedding(resource.getId(), vectorStr);
                        log.info("Persisted {}d vector embedding for resource ID {}", embedding.length, resourceId);

                        // Check for conceptual duplicates in the same course (threshold >= 88%)
                        if (resource.getCourse() != null) {
                            List<Object[]> duplicates = resourceRepository.findConceptualDuplicatesInCourse(
                                    resource.getCourse().getId(),
                                    resource.getId(),
                                    vectorStr,
                                    0.88,
                                    1
                            );
                            if (!duplicates.isEmpty()) {
                                Object[] topMatch = duplicates.get(0);
                                Long duplicateId = ((Number) topMatch[0]).longValue();
                                double sim = ((Number) topMatch[1]).doubleValue();
                                log.warn("Conceptual duplicate detected: Resource ID {} is {:.1f}% similar to existing Resource ID {}",
                                        resourceId, sim * 100, duplicateId);
                            }
                        }
                    }
                } catch (Exception vectorEx) {
                    log.warn("Vector embedding generation failed for resource ID {}: {}", resourceId, vectorEx.getMessage());
                }

            } else {
                log.warn("AI analysis for resource ID {} returned empty output.", resourceId);
                resource.setAiStatus(Resource.AiStatus.FAILED);
                resourceRepository.save(resource);
            }

        } catch (Exception e) {
            log.error("Unexpected error during background AI processing for resource ID {}: {}", resourceId, e.getMessage(), e);
            try {
                resource.setAiStatus(Resource.AiStatus.FAILED);
                resourceRepository.save(resource);
            } catch (Exception ex) {
                log.error("Failed to update resource AI status to FAILED: {}", ex.getMessage());
            }
        }
    }
}
