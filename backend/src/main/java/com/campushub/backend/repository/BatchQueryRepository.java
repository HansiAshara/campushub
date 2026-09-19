package com.campushub.backend.repository;

import com.campushub.backend.entity.BatchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchQueryRepository extends JpaRepository<BatchQuery, Long> {
    List<BatchQuery> findByBatchIdOrderByCreatedAtDesc(Long batchId);
}
