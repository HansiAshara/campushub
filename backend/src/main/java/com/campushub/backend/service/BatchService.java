package com.campushub.backend.service;

import com.campushub.backend.dto.BatchRequest;
import com.campushub.backend.dto.BatchResponse;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.repository.BatchRepository;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BatchService {

    private final BatchRepository batchRepository;
    private final UserRepository userRepository;

    public BatchService(BatchRepository batchRepository, UserRepository userRepository) {
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
    }

    public BatchResponse create(BatchRequest request) {
        Batch batch = new Batch();
        batch.setName(request.getName());
        batch.setIntakeYear(request.getIntakeYear());
        Batch saved = batchRepository.save(batch);
        return toResponse(saved);
    }

    @Transactional
    public void assignBatchLeader(Long batchId, Long userId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + batchId));

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Demote existing batch leader(s) for this batch (if any other than target)
        List<User> oldLeaders = userRepository.findByBatchIdAndRole(batchId, User.Role.BATCH_LEADER);
        for (User oldLeader : oldLeaders) {
            if (!oldLeader.getId().equals(userId)) {
                oldLeader.setRole(User.Role.STUDENT);
                userRepository.save(oldLeader);
            }
        }

        // Set role of target user to BATCH_LEADER and attach to batch
        target.setBatch(batch);
        target.setRole(User.Role.BATCH_LEADER);
        userRepository.save(target);
    }

    public List<BatchResponse> getAll() {
        return batchRepository.findAll().stream().map(this::toResponse).toList();
    }

    private BatchResponse toResponse(Batch b) {
        return new BatchResponse(b.getId(), b.getName(), b.getIntakeYear());
    }
}