package com.campushub.backend.controller;

import com.campushub.backend.dto.VoteRequest;
import com.campushub.backend.dto.VoteSummaryResponse;
import com.campushub.backend.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources/{resourceId}/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public ResponseEntity<VoteSummaryResponse> vote(@PathVariable Long resourceId, @Valid @RequestBody VoteRequest request) {
        return ResponseEntity.ok(voteService.castVote(resourceId, request.getValue()));
    }

    @GetMapping
    public ResponseEntity<VoteSummaryResponse> getSummary(@PathVariable Long resourceId) {
        return ResponseEntity.ok(voteService.getSummary(resourceId));
    }
}