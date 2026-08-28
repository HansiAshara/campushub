package com.campushub.backend.controller;

import com.campushub.backend.dto.BatchRequest;
import com.campushub.backend.dto.BatchResponse;
import com.campushub.backend.service.BatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchResponse> create(@Valid @RequestBody BatchRequest request) {
        return ResponseEntity.ok(batchService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BatchResponse>> getAll() {
        return ResponseEntity.ok(batchService.getAll());
    }

    @PostMapping("/{batchId}/leader/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignBatchLeader(@PathVariable Long batchId, @PathVariable Long userId) {
        batchService.assignBatchLeader(batchId, userId);
        return ResponseEntity.ok().build();
    }
}