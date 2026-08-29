package com.campushub.backend.service;

import com.campushub.backend.dto.BatchRequest;
import com.campushub.backend.dto.BatchResponse;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.BatchRepository;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BatchService {

    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public BatchService(BatchRepository batchRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public BatchResponse create(BatchRequest request) {
        Batch batch = new Batch();
        batch.setName(request.getName());
        batch.setIntakeYear(request.getIntakeYear());
        Batch saved = batchRepository.save(batch);
        return toResponse(saved);
    }

    public BatchResponse update(Long id, BatchRequest request) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + id));
        batch.setName(request.getName());
        batch.setIntakeYear(request.getIntakeYear());
        Batch updated = batchRepository.save(batch);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + id));

        // Demote leaders / unlink users from this batch
        List<User> leaders = userRepository.findByBatchIdAndRole(id, User.Role.BATCH_LEADER);
        for (User leader : leaders) {
            leader.setRole(User.Role.STUDENT);
            userRepository.save(leader);
        }

        batchRepository.delete(batch);
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

    @Transactional
    public void removeBatchLeader(Long batchId) {
        List<User> oldLeaders = userRepository.findByBatchIdAndRole(batchId, User.Role.BATCH_LEADER);
        for (User oldLeader : oldLeaders) {
            oldLeader.setRole(User.Role.STUDENT);
            userRepository.save(oldLeader);
        }
    }

    public List<BatchResponse> getAll() {
        return batchRepository.findAll().stream().map(this::toResponse).toList();
    }

    private BatchResponse toResponse(Batch b) {
        List<User> leaders = userRepository.findByBatchIdAndRole(b.getId(), User.Role.BATCH_LEADER);
        User leader = leaders.isEmpty() ? null : leaders.get(0);
        long studentCount = userRepository.countByBatch_Id(b.getId());
        long courseCount = courseRepository.countByBatch_Id(b.getId());

        return new BatchResponse(
                b.getId(),
                b.getName(),
                b.getIntakeYear(),
                leader != null ? leader.getId() : null,
                leader != null ? leader.getName() : null,
                leader != null ? leader.getEmail() : null,
                leader != null ? leader.getIndexNo() : null,
                studentCount,
                courseCount
        );
    }
}