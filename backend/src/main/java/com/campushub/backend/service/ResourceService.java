package com.campushub.backend.service;

import com.campushub.backend.dto.ResourceResponse;
import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.ResourceRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
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
    private final PermissionService permissionService;

    public ResourceService(ResourceRepository resourceRepository, CourseRepository courseRepository,
                            UserRepository userRepository, FileStorageService fileStorageService,
                            PermissionService permissionService) {
        this.resourceRepository = resourceRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.permissionService = permissionService;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public ResourceResponse uploadResource(String title, String resourceType, Long courseId, MultipartFile file) {
        User uploader = currentUser();
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String fileHash = fileStorageService.computeFileHash(file);
        resourceRepository.findByFileHash(fileHash).ifPresent(existing -> {
            throw new IllegalArgumentException("This exact file has already been uploaded: \"" + existing.getTitle() + "\"");
        });

        String fileUrl = fileStorageService.uploadFile(file);

        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setFileUrl(fileUrl);
        resource.setFileHash(fileHash);
        resource.setResourceType(Resource.ResourceType.valueOf(resourceType));
        resource.setCourse(course);
        resource.setUploadedBy(uploader);

        Resource saved = resourceRepository.save(resource);
        return toResponse(saved, uploader);
    }

    public List<ResourceResponse> getByCourse(Long courseId) {
        User user = currentUser();
        return resourceRepository.findByCourseId(courseId).stream().map(r -> toResponse(r, user)).toList();
    }

    public List<ResourceResponse> getMine() {
        User user = currentUser();
        return resourceRepository.findByUploadedById(user.getId()).stream().map(r -> toResponse(r, user)).toList();
    }

    public ResourceResponse updateResource(Long resourceId, String title, String resourceType) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId).orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!permissionService.canEditResource(user, resource)) {
            throw new AccessDeniedException("You don't have permission to edit this resource");
        }

        resource.setTitle(title);
        resource.setResourceType(Resource.ResourceType.valueOf(resourceType));
        Resource saved = resourceRepository.save(resource);
        return toResponse(saved, user);
    }

    public void deleteResource(Long resourceId) {
        User user = currentUser();
        Resource resource = resourceRepository.findById(resourceId).orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!permissionService.canEditResource(user, resource)) {
            throw new AccessDeniedException("You don't have permission to delete this resource");
        }

        resourceRepository.delete(resource);
    }

    private ResourceResponse toResponse(Resource resource, User currentUser) {
        boolean canEdit = permissionService.canEditResource(currentUser, resource);
        return new ResourceResponse(
                resource.getId(), resource.getTitle(), resource.getFileUrl(),
                resource.getResourceType().name(), resource.getSummary(),
                resource.getCourse().getName(), resource.getUploadedBy().getName(),
                resource.getUploadedBy().getId(), resource.getCreatedAt(), canEdit
        );
    }
}