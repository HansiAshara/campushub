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
        return user != null && user.getRole() == User.Role.ADMIN;
    }

    public boolean canManageCoursesForBatch(User user, Long batchId) {
        if (user == null || batchId == null) return false;
        boolean isEnrolledInBatch = user.getBatch() != null && user.getBatch().getId().equals(batchId);
        if (isEnrolledInBatch) {
            return user.getRole() == User.Role.BATCH_LEADER || user.getRole() == User.Role.ADMIN;
        }
        return false;
    }

    public boolean canManageCourse(User user, Long courseId, Long batchId) {
        if (user == null) return false;
        if (canManageCoursesForBatch(user, batchId)) return true;
        return courseModeratorRepository.existsByCourseIdAndUserId(courseId, user.getId());
    }

    public boolean canManageCourse(User user, Long courseId) {
        if (isAdmin(user)) return true;
        return courseModeratorRepository.existsByCourseIdAndUserId(courseId, user.getId());
    }

    public boolean canEditResource(User user, Resource resource) {
        if (isAdmin(user)) return true;
        return resource.getUploadedBy() != null && resource.getUploadedBy().getId().equals(user.getId());
    }
}