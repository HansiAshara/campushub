package com.campushub.backend.service;

import com.campushub.backend.entity.Tag;
import com.campushub.backend.repository.TagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service managing normalized academic tags for resources.
 * <p>
 * Ensures topics like "TCP", "tcp", and "Tcp" resolve to the exact same database record,
 * preventing duplicate tag proliferation and ensuring consistent searchability.
 */
@Service
public class TagService {

    private static final Logger log = LoggerFactory.getLogger(TagService.class);

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    /**
     * Resolves an existing tag by its normalized lowercase form, or creates a new one.
     */
    @Transactional
    public Tag getOrCreateTag(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            return null;
        }

        String displayName = sanitizeDisplayName(rawName);
        String normalized = displayName.toLowerCase();

        return tagRepository.findByNormalizedName(normalized).orElseGet(() -> {
            log.info("Creating new normalized tag: '{}' (normalized: '{}')", displayName, normalized);
            return tagRepository.save(new Tag(displayName, normalized));
        });
    }

    /**
     * Resolves a collection of raw tag strings into persistent Tag entities.
     * Deduplicates incoming tags by normalized lowercase name in memory first to minimize database roundtrips.
     */
    @Transactional
    public Set<Tag> getOrCreateTags(Collection<String> rawNames) {
        if (rawNames == null || rawNames.isEmpty()) {
            return Collections.emptySet();
        }

        // Deduplicate in memory by normalized name
        Map<String, String> uniqueNormalizedToDisplay = new LinkedHashMap<>();
        for (String raw : rawNames) {
            if (raw != null && !raw.isBlank()) {
                String displayName = sanitizeDisplayName(raw);
                String normalized = displayName.toLowerCase();
                uniqueNormalizedToDisplay.putIfAbsent(normalized, displayName);
            }
        }

        Set<Tag> resolvedTags = new HashSet<>();
        for (Map.Entry<String, String> entry : uniqueNormalizedToDisplay.entrySet()) {
            String normalized = entry.getKey();
            String display = entry.getValue();

            Tag tag = tagRepository.findByNormalizedName(normalized).orElseGet(() -> {
                log.info("Creating new normalized tag: '{}' (normalized: '{}')", display, normalized);
                return tagRepository.save(new Tag(display, normalized));
            });
            resolvedTags.add(tag);
        }
        return resolvedTags;
    }

    /**
     * Searches tags matching a given prefix or substring.
     */
    @Transactional(readOnly = true)
    public List<Tag> searchTags(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        return tagRepository.findByNameContainingIgnoreCase(query.trim());
    }

    private String sanitizeDisplayName(String raw) {
        String trimmed = raw.trim();
        // Capitalize first character if not already
        if (!trimmed.isEmpty() && Character.isLowerCase(trimmed.charAt(0))) {
            return Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1);
        }
        return trimmed;
    }
}
