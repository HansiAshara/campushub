package com.campushub.backend.repository;

import com.campushub.backend.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    Optional<Resource> findByFileHash(String fileHash);
    Optional<Resource> findByFileHashAndCourseIdAndResourceType(String fileHash, Long courseId, Resource.ResourceType resourceType);
    List<Resource> findByCourseId(Long courseId);
    List<Resource> findByUploadedById(Long userId);
}