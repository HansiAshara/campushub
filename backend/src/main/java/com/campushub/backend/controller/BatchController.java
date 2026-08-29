package com.campushub.backend.controller;

import com.campushub.backend.dto.BatchRequest;
import com.campushub.backend.dto.BatchResponse;
import com.campushub.backend.service.BatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BatchRequest request) {
        if (!isAdmin()) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        return ResponseEntity.ok(batchService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BatchResponse>> getAll() {
        return ResponseEntity.ok(batchService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody BatchRequest request) {
        if (!isAdmin()) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        return ResponseEntity.ok(batchService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!isAdmin()) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        batchService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{batchId}/leader/{userId}")
    public ResponseEntity<?> assignBatchLeader(@PathVariable Long batchId, @PathVariable Long userId) {
        if (!isAdmin()) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        batchService.assignBatchLeader(batchId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{batchId}/leader")
    public ResponseEntity<?> removeBatchLeader(@PathVariable Long batchId) {
        if (!isAdmin()) return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        batchService.removeBatchLeader(batchId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<?> debugAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return ResponseEntity.ok(java.util.Map.of("status", "no auth"));
        }
        return ResponseEntity.ok(java.util.Map.of(
            "principal", auth.getName(),
            "authorities", auth.getAuthorities().stream().map(a -> a.getAuthority()).toList(),
            "isAdmin", isAdmin(),
            "authClass", auth.getClass().getName()
        ));
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}