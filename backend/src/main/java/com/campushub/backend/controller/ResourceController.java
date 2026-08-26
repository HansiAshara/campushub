package com.campushub.backend.controller;

import com.campushub.backend.dto.ResourceRequest;
import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.create(request));
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