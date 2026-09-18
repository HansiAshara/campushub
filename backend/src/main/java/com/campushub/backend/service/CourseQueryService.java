package com.campushub.backend.service;

import com.campushub.backend.dto.CourseQueryRequest;
import com.campushub.backend.dto.CourseQueryResponse;
import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.CourseQuery;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CourseQueryRepository;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseQueryService {

    private final CourseQueryRepository queryRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    public CourseQueryService(CourseQueryRepository queryRepository, CourseRepository courseRepository, UserRepository userRepository, PermissionService permissionService) {
        this.queryRepository = queryRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.permissionService = permissionService;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public CourseQueryResponse createQuery(Long courseId, CourseQueryRequest request) {
        User student = currentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        CourseQuery query = new CourseQuery();
        query.setCourse(course);
        query.setStudent(student);
        query.setCategory(request.getCategory());
        query.setMessage(request.getMessage());
        query.setStatus(CourseQuery.Status.OPEN);

        CourseQuery saved = queryRepository.save(query);
        return toResponse(saved);
    }

    public List<CourseQueryResponse> getQueriesByCourse(Long courseId) {
        User user = currentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!permissionService.canManageCourse(user, courseId, course.getBatch().getId())) {
            throw new AccessDeniedException("Only the module coordinator or admin can view queries.");
        }

        return queryRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CourseQueryResponse resolveQuery(Long queryId) {
        User user = currentUser();
        CourseQuery query = queryRepository.findById(queryId)
                .orElseThrow(() -> new IllegalArgumentException("Query not found"));

        if (!permissionService.canManageCourse(user, query.getCourse().getId(), query.getCourse().getBatch().getId())) {
            throw new AccessDeniedException("Only the module coordinator or admin can resolve queries.");
        }

        query.setStatus(CourseQuery.Status.RESOLVED);
        CourseQuery saved = queryRepository.save(query);
        return toResponse(saved);
    }

    private CourseQueryResponse toResponse(CourseQuery query) {
        return new CourseQueryResponse(
                query.getId(),
                query.getCourse().getId(),
                query.getStudent().getName(),
                query.getStudent().getIndexNo(),
                query.getCategory(),
                query.getMessage(),
                query.getStatus().name(),
                query.getCreatedAt()
        );
    }
}
