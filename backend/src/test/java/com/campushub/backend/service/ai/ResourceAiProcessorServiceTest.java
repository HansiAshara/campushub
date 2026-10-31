package com.campushub.backend.service.ai;

import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.Tag;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.service.TagService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ResourceAiProcessorServiceTest {

    private ResourceRepository resourceRepository;
    private DocumentTextExtractorService documentTextExtractorService;
    private TextPreprocessorService textPreprocessorService;
    private AiService aiService;
    private TagService tagService;
    private ResourceAiProcessorService processorService;

    @BeforeEach
    void setUp() {
        resourceRepository = Mockito.mock(ResourceRepository.class);
        documentTextExtractorService = Mockito.mock(DocumentTextExtractorService.class);
        textPreprocessorService = Mockito.mock(TextPreprocessorService.class);
        aiService = Mockito.mock(AiService.class);
        tagService = Mockito.mock(TagService.class);

        processorService = new ResourceAiProcessorService(
                resourceRepository,
                documentTextExtractorService,
                textPreprocessorService,
                aiService,
                tagService
        );
    }

    @Test
    @DisplayName("Should successfully process resource and update summary, tags, and status to COMPLETED")
    void testSuccessfulProcessing() {
        Course course = new Course();
        course.setCode("CS302");
        course.setName("Computer Networks");

        Resource resource = new Resource();
        resource.setId(1L);
        resource.setTitle("TCP Overview");
        resource.setCourse(course);

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        ExtractedDocument extracted = ExtractedDocument.success("TCP Congestion control and slow start mechanisms explained.", 1);
        when(documentTextExtractorService.extract(anyString(), any(byte[].class))).thenReturn(extracted);

        CleanedDocument cleaned = new CleanedDocument(extracted.text(), 60, 60, 8, 1, List.of(), true, "OK");
        when(textPreprocessorService.preprocess(extracted)).thenReturn(cleaned);

        ResourceAiResult aiResult = new ResourceAiResult("Concise summary of TCP mechanisms.", List.of("TCP", "Congestion Control"));
        when(aiService.generateSummaryAndTags(eq(cleaned), eq("TCP Overview"), anyString())).thenReturn(aiResult);

        Tag tag1 = new Tag(1L, "TCP", "tcp", null);
        Tag tag2 = new Tag(2L, "Congestion Control", "congestion control", null);
        when(tagService.getOrCreateTags(aiResult.tags())).thenReturn(Set.of(tag1, tag2));

        processorService.processResourceAsync(1L, "lecture.pdf", new byte[]{1, 2, 3});

        assertEquals(Resource.AiStatus.COMPLETED, resource.getAiStatus());
        assertEquals("Concise summary of TCP mechanisms.", resource.getSummary());
        assertEquals(2, resource.getTags().size());
        verify(resourceRepository, atLeastOnce()).save(resource);
    }

    @Test
    @DisplayName("Should mark resource as SKIPPED when file has no extractable text")
    void testSkippedWhenNoExtractableText() {
        Resource resource = new Resource();
        resource.setId(2L);
        when(resourceRepository.findById(2L)).thenReturn(Optional.of(resource));

        ExtractedDocument emptyDoc = ExtractedDocument.empty("Scanned image");
        when(documentTextExtractorService.extract(anyString(), any(byte[].class))).thenReturn(emptyDoc);

        processorService.processResourceAsync(2L, "scanned-notes.pdf", new byte[]{1, 2});

        assertEquals(Resource.AiStatus.SKIPPED, resource.getAiStatus());
        assertTrue(resource.getSummary().contains("scanned"));
    }

    @Test
    @DisplayName("Should mark resource as FAILED when unexpected error occurs without crashing")
    void testHandlesFailureGracefully() {
        Resource resource = new Resource();
        resource.setId(3L);
        when(resourceRepository.findById(3L)).thenReturn(Optional.of(resource));

        when(documentTextExtractorService.extract(anyString(), any(byte[].class)))
                .thenThrow(new RuntimeException("Extraction service failure"));

        processorService.processResourceAsync(3L, "broken.pdf", new byte[]{1});

        assertEquals(Resource.AiStatus.FAILED, resource.getAiStatus());
    }
}

