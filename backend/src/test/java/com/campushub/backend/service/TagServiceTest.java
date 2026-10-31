package com.campushub.backend.service;

import com.campushub.backend.entity.Tag;
import com.campushub.backend.repository.TagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TagServiceTest {

    private TagRepository tagRepository;
    private TagService tagService;

    @BeforeEach
    void setUp() {
        tagRepository = Mockito.mock(TagRepository.class);
        tagService = new TagService(tagRepository);
    }

    @Test
    @DisplayName("Should reuse existing tag when normalized lowercase name matches")
    void testReusesExistingNormalizedTag() {
        Tag existingTag = new Tag(1L, "TCP", "tcp", java.time.LocalDateTime.now());
        when(tagRepository.findByNormalizedName("tcp")).thenReturn(Optional.of(existingTag));

        Tag result1 = tagService.getOrCreateTag("TCP");
        Tag result2 = tagService.getOrCreateTag("tcp");
        Tag result3 = tagService.getOrCreateTag("  Tcp  ");

        assertEquals(existingTag, result1);
        assertEquals(existingTag, result2);
        assertEquals(existingTag, result3);
        verify(tagRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create new tag when normalized name does not exist")
    void testCreatesNewTag() {
        when(tagRepository.findByNormalizedName("congestion control")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(invocation -> {
            Tag tag = invocation.getArgument(0);
            tag.setId(10L);
            return tag;
        });

        Tag created = tagService.getOrCreateTag("congestion control");

        assertNotNull(created);
        assertEquals("Congestion control", created.getName());
        assertEquals("congestion control", created.getNormalizedName());
        verify(tagRepository, times(1)).save(any(Tag.class));
    }

    @Test
    @DisplayName("Should resolve and deduplicate multiple tag names")
    void testGetOrCreateTagsCollection() {
        when(tagRepository.findByNormalizedName("sliding window")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> inv.getArgument(0));

        Set<Tag> tags = tagService.getOrCreateTags(List.of("Sliding Window", "sliding window", "  SLIDING WINDOW  "));

        // All three should map to 1 unique Tag entity
        assertEquals(1, tags.size());
    }
}

