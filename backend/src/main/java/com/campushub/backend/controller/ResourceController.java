package com.campushub.backend.controller;

import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.dto.ResourceUpdateRequest;
import com.campushub.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ResourceResponse> upload(
            @RequestParam String title,
            @RequestParam String resourceType,
            @RequestParam Long courseId,
            @RequestParam MultipartFile file) {
        return ResponseEntity.ok(resourceService.uploadResource(title, resourceType, courseId, file));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ResourceResponse>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(resourceService.getByCourse(courseId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ResourceResponse>> getMine() {
        return ResponseEntity.ok(resourceService.getMine());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> update(@PathVariable Long id, @Valid @RequestBody ResourceUpdateRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request.getTitle(), request.getResourceType()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}