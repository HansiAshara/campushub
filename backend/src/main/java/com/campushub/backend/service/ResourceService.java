package com.campushub.backend.service;

import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.Tag;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.repository.UserRepository;
import com.campushub.backend.service.ai.AiService;
import com.campushub.backend.service.ai.CleanedDocument;
import com.campushub.backend.service.ai.DocumentTextExtractorService;
import com.campushub.backend.service.ai.ExtractedDocument;
import com.campushub.backend.service.ai.ResourceAiProcessorService;
import com.campushub.backend.service.ai.ResourceAiResult;
import com.campushub.backend.service.ai.TextPreprocessorService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.campushub.backend.service.ai.embedding.EmbeddingService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PermissionService permissionService;
    private final DocumentTextExtractorService documentTextExtractorService;
    private final TextPreprocessorService textPreprocessorService;
    private final AiService aiService;
    private final TagService tagService;
    private final ResourceAiProcessorService resourceAiProcessorService;
    private final EmbeddingService embeddingService;

    public ResourceService(ResourceRepository resourceRepository, CourseRepository courseRepository,
                            UserRepository userRepository, FileStorageService fileStorageService,
                            PermissionService permissionService,
                            DocumentTextExtractorService documentTextExtractorService,
                            TextPreprocessorService textPreprocessorService,
                            AiService aiService,
                            TagService tagService,
                            ResourceAiProcessorService resourceAiProcessorService,
                            EmbeddingService embeddingService) {
        this.resourceRepository = resourceRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.permissionService = permissionService;
        this.documentTextExtractorService = documentTextExtractorService;
        this.textPreprocessorService = textPreprocessorService;
        this.aiService = aiService;
        this.tagService = tagService;
        this.resourceAiProcessorService = resourceAiProcessorService;
        this.embeddingService = embeddingService;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public ResourceResponse uploadResource(String title, String resourceType, Long courseId, MultipartFile file) {
        User uploader = currentUser();
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String fileHash = fileStorageService.computeFileHash(file);
        Resource.ResourceType typeEnum = Resource.ResourceType.valueOf(resourceType);
        
        resourceRepository.findByFileHashAndCourseIdAndResourceType(fileHash, courseId, typeEnum).ifPresent(existing -> {
            throw new IllegalArgumentException("This exact file has already been uploaded in this module under this category: \"" + existing.getTitle() + "\"");
        });

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file data", e);
        }

        String fileUrl = fileStorageService.uploadFile(file);

        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setFileUrl(fileUrl);
        resource.setFileHash(fileHash);
        resource.setResourceType(typeEnum);
        resource.setCourse(course);
        resource.setUploadedBy(uploader);
        resource.setAiStatus(Resource.AiStatus.PENDING);

        Resource saved = resourceRepository.save(resource);

        // Non-blocking background AI processing
        resourceAiProcessorService.processResourceAsync(saved.getId(), file.getOriginalFilename(), fileBytes);

        return toResponse(saved, uploader);
    }

    public ResourceResponse uploadLinkResource(String title, String resourceType, Long courseId, String linkUrl) {
        User uploader = currentUser();
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String fileHash = "link:" + linkUrl.hashCode();
        Resource.ResourceType typeEnum = Resource.ResourceType.valueOf(resourceType);
        
        resourceRepository.findByFileHashAndCourseIdAndResourceType(fileHash, courseId, typeEnum).ifPresent(existing -> {
            throw new IllegalArgumentException("This exact link has already been shared in this module.");
        });

        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setFileUrl(linkUrl);
        resource.setFileHash(fileHash);
        resource.setResourceType(typeEnum);
        resource.setCourse(course);
        resource.setUploadedBy(uploader);
        resource.setAiStatus(Resource.AiStatus.SKIPPED); // Link resources skip document AI

        Resource saved = resourceRepository.save(resource);
        return toResponse(saved, uploader);
    }

    public ResourceResponse getById(Long id) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        return toResponse(resource, user);
    }

    public List<ResourceResponse> getByCourse(Long courseId) {
        User user = currentUser();
        return resourceRepository.findByCourseId(courseId).stream().map(r -> toResponse(r, user)).toList();
    }

    public List<ResourceResponse> getMine() {
        User user = currentUser();
        return resourceRepository.findByUploadedById(user.getId()).stream().map(r -> toResponse(r, user)).toList();
    }

    public List<ResourceResponse> getByTag(String tagName) {
        User user = currentUser();
        if (tagName == null || tagName.isBlank()) {
            return List.of();
        }
        String normalized = tagName.trim().toLowerCase();
        return resourceRepository.findByTagNormalizedName(normalized)
                .stream().map(r -> toResponse(r, user)).toList();
    }

    public ResourceResponse updateResource(Long resourceId, String title, String resourceType) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId).orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!permissionService.canEditResource(user, resource)) {
            throw new AccessDeniedException("You don't have permission to edit this resource");
        }

        resource.setTitle(title);
        resource.setResourceType(Resource.ResourceType.valueOf(resourceType));
        Resource saved = resourceRepository.save(resource);
        return toResponse(saved, user);
    }

    public void deleteResource(Long resourceId) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId).orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!permissionService.canEditResource(user, resource)) {
            throw new AccessDeniedException("You don't have permission to delete this resource");
        }

        resourceRepository.delete(resource);
    }

    /**
     * Re-triggers asynchronous AI processing for an existing resource (e.g. if previous attempt failed).
     */
    public ResourceResponse reprocessResourceAi(Long resourceId) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!permissionService.canEditResource(user, resource)) {
            throw new AccessDeniedException("You don't have permission to reprocess this resource");
        }

        if (resource.getFileUrl() == null || resource.getFileUrl().contains("youtube.com") || resource.getFileUrl().contains("youtu.be")) {
            throw new IllegalArgumentException("Link resources cannot be processed with document AI");
        }

        byte[] fileBytes = fileStorageService.downloadFileBytes(resource.getFileUrl());
        if (fileBytes == null || fileBytes.length == 0) {
            throw new IllegalStateException("Failed to download file content from storage for AI reprocessing");
        }

        String fileName = resource.getTitle();
        if (!fileName.contains(".")) {
            fileName = resource.getFileUrl();
        }

        resource.setAiStatus(Resource.AiStatus.PENDING);
        resourceRepository.save(resource);

        resourceAiProcessorService.processResourceAsync(resource.getId(), fileName, fileBytes);

        return toResponse(resource, user);
    }

    /**
     * Previews document text extraction, preprocessing, and AI summary/tags generation
     * for any uploaded file without modifying database state. Useful for validation and testing.
     */
    public CleanedDocument previewPreprocess(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return CleanedDocument.empty("No file provided");
        }
        String filename = file.getOriginalFilename();
        try {
            ExtractedDocument extracted = documentTextExtractorService.extract(filename, file.getBytes());
            CleanedDocument cleaned = textPreprocessorService.preprocess(extracted);
            if (cleaned.hasSufficientContent()) {
                ResourceAiResult aiResult = aiService.generateSummaryAndTags(cleaned, filename, "");
                return new CleanedDocument(
                        cleaned.cleanedText(),
                        cleaned.originalCharacterCount(),
                        cleaned.cleanedCharacterCount(),
                        cleaned.wordCount(),
                        cleaned.pageCount(),
                        cleaned.chunks(),
                        cleaned.hasSufficientContent(),
                        cleaned.statusMessage(),
                        aiResult
                );
            }
            return cleaned;
        } catch (IOException e) {
            return CleanedDocument.empty("Failed to read file: " + e.getMessage());
        }
    }

    /**
     * Executes vector semantic search using pgvector cosine distance.
     * Generates a 768-dimensional embedding for the input query, then queries PostgreSQL.
     */
    public List<ResourceResponse> semanticSearch(Long courseId, String query, Double minSimilarity, Integer limit) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        User user = currentUser();
        float[] queryEmbedding = embeddingService.generateEmbedding(query);
        if (queryEmbedding == null || queryEmbedding.length == 0) {
            return List.of();
        }

        String queryVectorStr = embeddingService.toPgVectorString(queryEmbedding);
        double threshold = minSimilarity != null ? minSimilarity : 0.20; // default 20% minimum similarity
        int maxResults = limit != null && limit > 0 && limit <= 50 ? limit : 15;

        List<Object[]> results = resourceRepository.findSimilarResourceIds(courseId, queryVectorStr, threshold, maxResults);
        if (results.isEmpty()) {
            return List.of();
        }

        List<ResourceResponse> matchedResponses = new ArrayList<>();
        for (Object[] row : results) {
            Long resourceId = ((Number) row[0]).longValue();
            double similarity = ((Number) row[1]).doubleValue();

            resourceRepository.findById(resourceId).ifPresent(r -> {
                ResourceResponse resp = toResponse(r, user);
                resp.setSimilarityScore(Math.round(similarity * 1000.0) / 1000.0);
                matchedResponses.add(resp);
            });
        }

        return matchedResponses;
    }

    /**
     * Finds conceptually similar resources for an existing document.
     * Useful for conceptual duplicate alerts and recommended reading.
     */
    public List<ResourceResponse> findSimilarResources(Long resourceId, Integer limit) {
        Resource target = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        User user = currentUser();
        int maxResults = limit != null && limit > 0 && limit <= 10 ? limit : 3;

        String textToEmbed = embeddingService.buildEmbeddingText(
                target.getTitle(),
                target.getSummary(),
                target.getTags() != null ? target.getTags().stream().map(Tag::getName).toList() : List.of(),
                ""
        );

        float[] embedding = embeddingService.generateEmbedding(textToEmbed);
        String vectorStr = embeddingService.toPgVectorString(embedding);

        List<Object[]> duplicates = resourceRepository.findConceptualDuplicatesInCourse(
                target.getCourse().getId(),
                target.getId(),
                vectorStr,
                0.65, // 65% similarity threshold for related / similar documents
                maxResults
        );

        List<ResourceResponse> similarList = new ArrayList<>();
        for (Object[] row : duplicates) {
            Long similarId = ((Number) row[0]).longValue();
            double similarity = ((Number) row[1]).doubleValue();

            resourceRepository.findById(similarId).ifPresent(r -> {
                ResourceResponse resp = toResponse(r, user);
                resp.setSimilarityScore(Math.round(similarity * 1000.0) / 1000.0);
                similarList.add(resp);
            });
        }

        return similarList;
    }

    private ResourceResponse toResponse(Resource resource, User currentUser) {
        boolean canEdit = permissionService.canEditResource(currentUser, resource);
        String courseDisplayName = resource.getCourse().getCode() + " - " + resource.getCourse().getName();
        List<String> tagNames = resource.getTags() != null
                ? resource.getTags().stream().map(Tag::getName).sorted().toList()
                : List.of();
        String aiStatusStr = resource.getAiStatus() != null ? resource.getAiStatus().name() : "PENDING";

        return new ResourceResponse(
                resource.getId(), resource.getTitle(), resource.getFileUrl(),
                resource.getResourceType().name(), resource.getSummary(),
                courseDisplayName, resource.getUploadedBy().getName(),
                resource.getUploadedBy().getId(), resource.getCreatedAt(), canEdit,
                aiStatusStr, tagNames
        );
    }
}
