package com.campushub.backend.repository;

import com.campushub.backend.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Optional<Resource> findByFileHash(String fileHash);

    Optional<Resource> findByFileHashAndCourseIdAndResourceType(String fileHash, Long courseId, Resource.ResourceType resourceType);

    List<Resource> findByCourseId(Long courseId);

    List<Resource> findByUploadedById(Long userId);

    @Query("SELECT r FROM Resource r JOIN r.tags t WHERE t.normalizedName = :normalizedTag")
    List<Resource> findByTagNormalizedName(@Param("normalizedTag") String normalizedTag);
}
