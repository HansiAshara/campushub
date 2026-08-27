package com.campushub.backend.service;

import com.campushub.backend.dto.BatchRequest;
import com.campushub.backend.dto.BatchResponse;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.repository.BatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BatchService {

    private final BatchRepository batchRepository;

    public BatchService(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    public BatchResponse create(BatchRequest request) {
        Batch batch = new Batch();
        batch.setName(request.getName());
        batch.setIntakeYear(request.getIntakeYear());
        Batch saved = batchRepository.save(batch);
        return toResponse(saved);
    }

    public List<BatchResponse> getAll() {
        return batchRepository.findAll().stream().map(this::toResponse).toList();
    }

    private BatchResponse toResponse(Batch b) {
        return new BatchResponse(b.getId(), b.getName(), b.getIntakeYear());
    }
}