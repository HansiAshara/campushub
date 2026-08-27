package com.campushub.backend.controller;

import com.campushub.backend.dto.CommentRequest;
import com.campushub.backend.dto.CommentResponse;
import com.campushub.backend.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources/{resourceId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> add(@PathVariable Long resourceId, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(resourceId, request.getContent()));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getAll(@PathVariable Long resourceId) {
        return ResponseEntity.ok(commentService.getByResource(resourceId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}