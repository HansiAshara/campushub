package com.campushub.backend.service;

import com.campushub.backend.dto.CommentResponse;
import com.campushub.backend.entity.Comment;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CommentRepository;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, ResourceRepository resourceRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public CommentResponse addComment(Long resourceId, String content) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId).orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setResource(resource);

        Comment saved = commentRepository.save(comment);
        return toResponse(saved);
    }

    public List<CommentResponse> getByResource(Long resourceId) {
        return commentRepository.findByResourceIdOrderByCreatedAtAsc(resourceId)
                .stream().map(this::toResponse).toList();
    }

    public void deleteComment(Long commentId) {
        User user = currentUser();
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        boolean isOwner = comment.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(comment.getId(), comment.getContent(), comment.getUser().getName(), comment.getCreatedAt());
    }
}