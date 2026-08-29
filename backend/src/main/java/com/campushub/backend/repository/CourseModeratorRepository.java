package com.campushub.backend.repository;

import com.campushub.backend.entity.CourseModerator;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseModeratorRepository extends JpaRepository<CourseModerator, Long> {
    boolean existsByCourseIdAndUserId(Long courseId, Long userId);
    List<CourseModerator> findByCourseId(Long courseId);
    List<CourseModerator> findByUserId(Long userId);
    long countByUserId(Long userId);
    void deleteByCourseIdAndUserId(Long courseId, Long userId);
    void deleteByCourseId(Long courseId);
}