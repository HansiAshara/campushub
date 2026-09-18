package com.campushub.backend.repository;

import com.campushub.backend.entity.CourseQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseQueryRepository extends JpaRepository<CourseQuery, Long> {
    List<CourseQuery> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}
