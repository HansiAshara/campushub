package com.campushub.backend.controller;

import com.campushub.backend.dto.CourseQueryRequest;
import com.campushub.backend.dto.CourseQueryResponse;
import com.campushub.backend.service.CourseQueryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseQueryController {

    private final CourseQueryService queryService;

    public CourseQueryController(CourseQueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping("/{courseId}/queries")
    public ResponseEntity<CourseQueryResponse> createQuery(@PathVariable Long courseId, @Valid @RequestBody CourseQueryRequest request) {
        return ResponseEntity.ok(queryService.createQuery(courseId, request));
    }

    @GetMapping("/{courseId}/queries")
    public ResponseEntity<List<CourseQueryResponse>> getQueriesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(queryService.getQueriesByCourse(courseId));
    }

    @PutMapping("/queries/{queryId}/resolve")
    public ResponseEntity<CourseQueryResponse> resolveQuery(@PathVariable Long queryId) {
        return ResponseEntity.ok(queryService.resolveQuery(queryId));
    }
}
