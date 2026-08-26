package com.campushub.backend.service;

import com.campushub.backend.dto.ResourceRequest;
import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public ResourceService(ResourceRepository resourceRepository,
                            CourseRepository courseRepository,
                            UserRepository userRepository) {
        this.resourceRepository = resourceRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public ResourceResponse create(ResourceRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User uploader = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Resource resource = new Resource();
        resource.setTitle(request.getTitle());
        resource.setFileUrl(request.getFileUrl());
        resource.setFileHash(request.getFileHash());
        resource.setResourceType(Resource.ResourceType.valueOf(request.getResourceType()));
        resource.setCourse(course);
        resource.setUploadedBy(uploader);

        Resource saved = resourceRepository.save(resource);
        return toResponse(saved);
    }

    public List<ResourceResponse> getByCourse(Long courseId) {
        return resourceRepository.findByCourseId(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ResourceResponse> getAll() {
        return resourceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getTitle(),
                resource.getFileUrl(),
                resource.getResourceType().name(),
                resource.getSummary(),
                resource.getCourse().getName(),
                resource.getUploadedBy().getName(),
                resource.getCreatedAt()
        );
    }
}