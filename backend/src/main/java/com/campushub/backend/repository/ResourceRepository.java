package com.campushub.backend.repository;

import com.campushub.backend.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Persists the dense vector embedding for a resource.
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "UPDATE resources SET embedding = CAST(:embeddingStr AS vector) WHERE id = :id")
    void updateEmbedding(@Param("id") Long id, @Param("embeddingStr") String embeddingStr);

    /**
     * Finds resources ranked by cosine similarity against the query vector.
     * In pgvector, cosine distance is denoted by <=>.
     * Cosine similarity = 1.0 - (embedding <=> query_vector)
     * Returns: Object[] with [Long id, Double similarity]
     */
    @Query(nativeQuery = true, value = """
        SELECT r.id,
               1.0 - (r.embedding <=> CAST(:queryVector AS vector)) AS similarity
        FROM resources r
        WHERE (:courseId IS NULL OR r.course_id = :courseId)
          AND r.embedding IS NOT NULL
          AND (1.0 - (r.embedding <=> CAST(:queryVector AS vector))) >= :minSimilarity
        ORDER BY r.embedding <=> CAST(:queryVector AS vector) ASC
        LIMIT :limit
    """)
    List<Object[]> findSimilarResourceIds(
            @Param("courseId") Long courseId,
            @Param("queryVector") String queryVector,
            @Param("minSimilarity") double minSimilarity,
            @Param("limit") int limit
    );

    /**
     * Identifies potential conceptual duplicates within the same course.
     * Excludes the specified resource ID itself.
     */
    @Query(nativeQuery = true, value = """
        SELECT r.id,
               1.0 - (r.embedding <=> CAST(:queryVector AS vector)) AS similarity
        FROM resources r
        WHERE r.course_id = :courseId
          AND r.id <> :excludeResourceId
          AND r.embedding IS NOT NULL
          AND (1.0 - (r.embedding <=> CAST(:queryVector AS vector))) >= :minSimilarity
        ORDER BY r.embedding <=> CAST(:queryVector AS vector) ASC
        LIMIT :limit
    """)
    List<Object[]> findConceptualDuplicatesInCourse(
            @Param("courseId") Long courseId,
            @Param("excludeResourceId") Long excludeResourceId,
            @Param("queryVector") String queryVector,
            @Param("minSimilarity") double minSimilarity,
            @Param("limit") int limit
    );
}
