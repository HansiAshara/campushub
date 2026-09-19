package com.campushub.backend.service;

import com.campushub.backend.dto.BatchQueryRequest;
import com.campushub.backend.dto.BatchQueryResponse;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.entity.BatchQuery;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.BatchQueryRepository;
import com.campushub.backend.repository.BatchRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchQueryService {

    private final BatchQueryRepository queryRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;

    public BatchQueryService(BatchQueryRepository queryRepository, BatchRepository batchRepository, UserRepository userRepository) {
        this.queryRepository = queryRepository;
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BatchQueryResponse createQuery(Long batchId, BatchQueryRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        BatchQuery query = new BatchQuery();
        query.setBatch(batch);
        query.setStudent(student);
        query.setCategory(request.getCategory());
        query.setMessage(request.getMessage());
        query.setStatus(BatchQuery.Status.OPEN);

        BatchQuery savedQuery = queryRepository.save(query);
        return mapToResponse(savedQuery);
    }

    @Transactional(readOnly = true)
    public List<BatchQueryResponse> getQueriesByBatch(Long batchId) {
        return queryRepository.findByBatchIdOrderByCreatedAtDesc(batchId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BatchQueryResponse resolveQuery(Long queryId) {
        BatchQuery query = queryRepository.findById(queryId)
                .orElseThrow(() -> new RuntimeException("Query not found"));

        query.setStatus(BatchQuery.Status.RESOLVED);
        BatchQuery savedQuery = queryRepository.save(query);
        return mapToResponse(savedQuery);
    }

    private BatchQueryResponse mapToResponse(BatchQuery query) {
        return new BatchQueryResponse(
                query.getId(),
                query.getBatch().getId(),
                query.getStudent().getName(),
                query.getStudent().getIndexNo(),
                query.getCategory(),
                query.getMessage(),
                query.getStatus().name(),
                query.getCreatedAt()
        );
    }
}
