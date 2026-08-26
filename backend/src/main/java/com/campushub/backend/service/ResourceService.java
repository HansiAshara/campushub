package com.campushub.backend.service;

import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ResourceService(ResourceRepository resourceRepository,
                            CourseRepository courseRepository,
                            UserRepository userRepository,
                            FileStorageService fileStorageService) {
        this.resourceRepository = resourceRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public ResourceResponse uploadResource(String title, String resourceType, Long courseId, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User uploader = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String fileHash = fileStorageService.computeFileHash(file);

        var existing = resourceRepository.findByFileHash(fileHash);
        if (existing.isPresent()) {
            throw new IllegalArgumentException(
                "This exact file has already been uploaded: \"" + existing.get().getTitle() + "\""
            );
        }

        String fileUrl = fileStorageService.uploadFile(file);

        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setFileUrl(fileUrl);
        resource.setFileHash(fileHash);
        resource.setResourceType(Resource.ResourceType.valueOf(resourceType));
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