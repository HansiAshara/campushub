package com.campushub.backend.service;

import com.campushub.backend.dto.CourseRequest;
import com.campushub.backend.dto.CourseResponse;
import com.campushub.backend.entity.Course;
import com.campushub.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public CourseResponse create(CourseRequest request) {
        if (courseRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Course code already exists");
        }

        Course course = new Course();
        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setSemester(request.getSemester());

        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    public List<CourseResponse> getAll() {
        return courseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return toResponse(course);
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(course.getId(), course.getCode(), course.getName(), course.getSemester());
    }
}