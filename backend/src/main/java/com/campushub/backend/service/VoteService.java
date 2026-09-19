package com.campushub.backend.service;

import com.campushub.backend.dto.VoteSummaryResponse;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.User;
import com.campushub.backend.entity.Vote;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.repository.UserRepository;
import com.campushub.backend.repository.VoteRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public VoteService(VoteRepository voteRepository, ResourceRepository resourceRepository, UserRepository userRepository) {
        this.voteRepository = voteRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public VoteSummaryResponse castVote(Long resourceId, int value) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId).orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        Vote existing = voteRepository.findByUserIdAndResourceId(user.getId(), resourceId).orElse(null);

        if (existing != null) {
            existing.setValue(value);
            voteRepository.save(existing);
        } else {
            Vote vote = new Vote();
            vote.setUser(user);
            vote.setResource(resource);
            vote.setValue(value);
            voteRepository.save(vote);
        }

        return getSummary(resourceId);
    }

    public VoteSummaryResponse getSummary(Long resourceId) {
        User user = currentUser();
        List<Vote> votes = voteRepository.findByResourceId(resourceId);

        long totalRatings = votes.size();
        double averageRating = totalRatings > 0 
                ? votes.stream().mapToInt(Vote::getValue).average().orElse(0.0) 
                : 0.0;
        averageRating = Math.round(averageRating * 10.0) / 10.0;

        Integer userVote = votes.stream()
                .filter(v -> v.getUser().getId().equals(user.getId()))
                .map(Vote::getValue)
                .findFirst().orElse(null);

        return new VoteSummaryResponse(averageRating, totalRatings, userVote);
    }
}