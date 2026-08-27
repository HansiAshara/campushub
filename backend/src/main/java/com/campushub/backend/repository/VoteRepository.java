package com.campushub.backend.repository;

import com.campushub.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserIdAndResourceId(Long userId, Long resourceId);
    List<Vote> findByResourceId(Long resourceId);
}