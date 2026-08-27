package com.campushub.backend.service;

import com.campushub.backend.entity.Resource;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.CourseModeratorRepository;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    private final CourseModeratorRepository courseModeratorRepository;

    public PermissionService(CourseModeratorRepository courseModeratorRepository) {
        this.courseModeratorRepository = courseModeratorRepository;
    }

    public boolean isAdmin(User user) {
        return user.getRole() == User.Role.ADMIN;
    }

    public boolean canManageCourse(User user, Long courseId) {
        if (isAdmin(user)) return true;
        return courseModeratorRepository.existsByCourseIdAndUserId(courseId, user.getId());
    }

    public boolean canEditResource(User user, Resource resource) {
        if (isAdmin(user)) return true;
        if (resource.getUploadedBy().getId().equals(user.getId())) return true;
        return courseModeratorRepository.existsByCourseIdAndUserId(resource.getCourse().getId(), user.getId());
    }
}