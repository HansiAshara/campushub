package com.campushub.backend.service.ai;

import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.Tag;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.service.TagService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Background worker service for asynchronous AI extraction, summarization, and tag generation.
 * <p>
 * Ensures resource uploads return to the student immediately (Status: PENDING),
 * while document parsing, cleaning, and model analysis proceed non-blockingly.
 */
@Service
public class ResourceAiProcessorService {

    private static final Logger log = LoggerFactory.getLogger(ResourceAiProcessorService.class);

    private final ResourceRepository resourceRepository;
    private final DocumentTextExtractorService documentTextExtractorService;
    private final TextPreprocessorService textPreprocessorService;
    private final AiService aiService;
    private final TagService tagService;

    public ResourceAiProcessorService(
            ResourceRepository resourceRepository,
            DocumentTextExtractorService documentTextExtractorService,
            TextPreprocessorService textPreprocessorService,
            AiService aiService,
            TagService tagService
    ) {
        this.resourceRepository = resourceRepository;
        this.documentTextExtractorService = documentTextExtractorService;
        this.textPreprocessorService = textPreprocessorService;
        this.aiService = aiService;
        this.tagService = tagService;
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

            // 1. Deterministic text extraction
            ExtractedDocument extracted = documentTextExtractorService.extract(fileName, fileBytes);
            if (!extracted.hasExtractableText()) {
                log.info("Resource ID {} has no extractable text (e.g. scanned/image-only). Skipping AI.", resourceId);
                resource.setAiStatus(Resource.AiStatus.SKIPPED);
                resource.setSummary("Document contains scanned or non-extractable text. AI summary unavailable.");
                resourceRepository.save(resource);
                return;
            }

            // 2. Deterministic text preprocessing and chunking
            CleanedDocument cleaned = textPreprocessorService.preprocess(extracted);
            if (!cleaned.hasSufficientContent()) {
                log.info("Resource ID {} contains insufficient content. Skipping AI.", resourceId);
                resource.setAiStatus(Resource.AiStatus.SKIPPED);
                resource.setSummary("Document content is too brief for automated AI analysis.");
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

