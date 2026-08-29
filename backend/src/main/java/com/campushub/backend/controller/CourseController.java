package com.campushub.backend.controller;

import com.campushub.backend.dto.CourseRequest;
import com.campushub.backend.dto.CourseResponse;
import com.campushub.backend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ResponseEntity<?> create(@Valid @RequestBody CourseRequest request) {
        if (!hasRole("ROLE_ADMIN")) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        return ResponseEntity.ok(courseService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        if (!hasRole("ROLE_ADMIN")) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        return ResponseEntity.ok(courseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!hasRole("ROLE_ADMIN")) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        courseService.delete(id);
        return ResponseEntity.ok().build();
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

    @GetMapping("/moderators")
    public ResponseEntity<?> getAllModerators() {
        return ResponseEntity.ok(courseService.getAllModerators());
    }

    @PostMapping("/{courseId}/moderators/{userId}")
    public ResponseEntity<?> assignModerator(@PathVariable Long courseId, @PathVariable Long userId) {
        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_BATCH_LEADER"))
            return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        courseService.assignModerator(courseId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{courseId}/moderators/{userId}")
    public ResponseEntity<?> removeModerator(@PathVariable Long courseId, @PathVariable Long userId) {
        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_BATCH_LEADER"))
            return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        courseService.removeModerator(courseId, userId);
        return ResponseEntity.ok().build();
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }
}