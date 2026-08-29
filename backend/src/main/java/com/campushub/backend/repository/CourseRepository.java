package com.campushub.backend.repository;

import com.campushub.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCodeAndBatchId(String code, Long batchId);
    List<Course> findByBatchId(Long batchId);
    List<Course> findByBatchIdAndAcademicYearAndSemesterNumber(Long batchId, int academicYear, int semesterNumber);
    long countByBatch_Id(Long batchId);
}