package com.campushub.backend.repository;

import com.campushub.backend.entity.CourseModerator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModeratorRepository extends JpaRepository<CourseModerator, Long> {
    boolean existsByCourseIdAndUserId(Long courseId, Long userId);
}