package com.campushub.backend.controller;

import com.campushub.backend.dto.CourseRequest;
import com.campushub.backend.dto.CourseResponse;
import com.campushub.backend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.create(request));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<CourseResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(courseService.getByBatch(batchId));
    }

    @GetMapping("/batch/{batchId}/year/{year}/semester/{semester}")
    public ResponseEntity<List<CourseResponse>> getByBatchAndSemester(
            @PathVariable Long batchId, @PathVariable int year, @PathVariable int semester) {
        return ResponseEntity.ok(courseService.getByBatchAndSemester(batchId, year, semester));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @PostMapping("/{courseId}/moderators/{userId}")
    public ResponseEntity<Void> assignModerator(@PathVariable Long courseId, @PathVariable Long userId) {
        courseService.assignModerator(courseId, userId);
        return ResponseEntity.ok().build();
    }
}