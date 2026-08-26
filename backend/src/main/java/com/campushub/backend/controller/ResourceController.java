package com.campushub.backend.controller;

import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.service.ResourceService;
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

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAll() {
        return ResponseEntity.ok(resourceService.getAll());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ResourceResponse>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(resourceService.getByCourse(courseId));
    }
}