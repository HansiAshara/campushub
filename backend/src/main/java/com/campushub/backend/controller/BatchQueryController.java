package com.campushub.backend.controller;

import com.campushub.backend.dto.BatchQueryRequest;
import com.campushub.backend.dto.BatchQueryResponse;
import com.campushub.backend.service.BatchQueryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class BatchQueryController {

    private final BatchQueryService queryService;

    public BatchQueryController(BatchQueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping("/{batchId}/queries")
    public ResponseEntity<BatchQueryResponse> createQuery(@PathVariable Long batchId, @Valid @RequestBody BatchQueryRequest request) {
        return ResponseEntity.ok(queryService.createQuery(batchId, request));
    }

    @GetMapping("/{batchId}/queries")
    public ResponseEntity<List<BatchQueryResponse>> getQueriesByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(queryService.getQueriesByBatch(batchId));
    }

    @PatchMapping("/queries/{queryId}/resolve")
    public ResponseEntity<BatchQueryResponse> resolveQuery(@PathVariable Long queryId) {
        return ResponseEntity.ok(queryService.resolveQuery(queryId));
    }
}
