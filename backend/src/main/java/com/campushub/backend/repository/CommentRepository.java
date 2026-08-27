package com.campushub.backend.repository;

import com.campushub.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByResourceIdOrderByCreatedAtAsc(Long resourceId);
}