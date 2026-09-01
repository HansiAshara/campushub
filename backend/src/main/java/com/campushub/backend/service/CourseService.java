package com.campushub.backend.service;

import com.campushub.backend.dto.CourseRequest;
import com.campushub.backend.dto.CourseResponse;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.entity.Course;
import com.campushub.backend.entity.CourseModerator;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.BatchRepository;
import com.campushub.backend.repository.CourseModeratorRepository;
import com.campushub.backend.repository.CourseRepository;
import com.campushub.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final CourseModeratorRepository courseModeratorRepository;
    private final PermissionService permissionService;

    public CourseService(CourseRepository courseRepository, BatchRepository batchRepository,
                          UserRepository userRepository, CourseModeratorRepository courseModeratorRepository,
                          PermissionService permissionService) {
        this.courseRepository = courseRepository;
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
        this.courseModeratorRepository = courseModeratorRepository;
        this.permissionService = permissionService;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public CourseResponse create(CourseRequest request) {
        User user = currentUser();
        if (!permissionService.isAdmin(user)) {
            throw new AccessDeniedException("Only admins can create courses");
        }

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        if (courseRepository.findByCodeAndBatchId(request.getCode(), batch.getId()).isPresent()) {
            throw new IllegalArgumentException("This course code already exists for this batch");
        }

        Course course = new Course();
        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setAcademicYear(request.getAcademicYear());
        course.setSemesterNumber(request.getSemesterNumber());
        course.setBatch(batch);

        Course saved = courseRepository.save(course);
        return toResponse(saved, user);
    }

    public CourseResponse update(Long id, CourseRequest request) {
        User user = currentUser();
        if (!permissionService.isAdmin(user)) {
            throw new AccessDeniedException("Only admins can update courses");
        }

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setAcademicYear(request.getAcademicYear());
        course.setSemesterNumber(request.getSemesterNumber());
        course.setBatch(batch);

        Course updated = courseRepository.save(course);
        return toResponse(updated, user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Long id) {
        User user = currentUser();
        if (!permissionService.isAdmin(user)) {
            throw new AccessDeniedException("Only admins can delete courses");
        }

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Delete associated course moderators
        courseModeratorRepository.deleteByCourseId(id);
        courseRepository.delete(course);
    }

    public List<com.campushub.backend.dto.CourseModeratorResponse> getAllModerators() {
        return courseModeratorRepository.findAll().stream()
                .map(cm -> new com.campushub.backend.dto.CourseModeratorResponse(
                        cm.getId(),
                        cm.getCourse().getId(),
                        cm.getCourse().getCode(),
                        cm.getCourse().getName(),
                        cm.getCourse().getBatch().getId(),
                        cm.getCourse().getBatch().getName(),
                        cm.getUser().getId(),
                        cm.getUser().getName(),
                        cm.getUser().getEmail(),
                        cm.getUser().getIndexNo()
                ))
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public void removeModerator(Long courseId, Long userId) {
        User currentUser = currentUser();
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!permissionService.isAdmin(currentUser)) {
            boolean isBatchLeader = currentUser.getRole() == User.Role.BATCH_LEADER;
            boolean isSameBatch = isBatchLeader && currentUser.getBatch() != null && course.getBatch() != null 
                    && currentUser.getBatch().getId().equals(course.getBatch().getId());
            if (!isSameBatch) {
                throw new AccessDeniedException("Only admins or the batch leader of this batch can remove module coordinators");
            }
        }

        courseModeratorRepository.deleteByCourseIdAndUserId(courseId, userId);

        // If user no longer moderates any course and is not a batch leader/admin, revert to STUDENT
        long remainingModCount = courseModeratorRepository.countByUserId(userId);
        if (remainingModCount == 0) {
            userRepository.findById(userId).ifPresent(u -> {
                if (u.getRole() == User.Role.MODULE_COORDINATOR) {
                    u.setRole(User.Role.STUDENT);
                    userRepository.save(u);
                }
            });
        }
    }

    public List<CourseResponse> getAll() {
        User user = currentUser();
        return courseRepository.findAll().stream().map(c -> toResponse(c, user)).toList();
    }

    public List<CourseResponse> getByBatch(Long batchId) {
        User user = currentUser();
        return courseRepository.findByBatchId(batchId).stream().map(c -> toResponse(c, user)).toList();
    }

    public List<CourseResponse> getByBatchAndSemester(Long batchId, int academicYear, int semesterNumber) {
        User user = currentUser();
        return courseRepository.findByBatchIdAndAcademicYearAndSemesterNumber(batchId, academicYear, semesterNumber)
                .stream().map(c -> toResponse(c, user)).toList();
    }

    public CourseResponse getById(Long id) {
        User user = currentUser();
        Course course = courseRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return toResponse(course, user);
    }

    public void assignModerator(Long courseId, Long userId) {
        User currentUser = currentUser();
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!permissionService.isAdmin(currentUser)) {
            boolean isBatchLeader = currentUser.getRole() == User.Role.BATCH_LEADER;
            boolean isSameBatch = isBatchLeader && currentUser.getBatch() != null && course.getBatch() != null 
                    && currentUser.getBatch().getId().equals(course.getBatch().getId());
            if (!isSameBatch) {
                throw new AccessDeniedException("Only admins or the batch leader of this batch can assign module coordinators");
            }
        }

        User targetUser = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (courseModeratorRepository.existsByCourseIdAndUserId(courseId, userId)) return;

        CourseModerator cm = new CourseModerator();
        cm.setCourse(course);
        cm.setUser(targetUser);
        courseModeratorRepository.save(cm);

        if (targetUser.getRole() == User.Role.STUDENT) {
            targetUser.setRole(User.Role.MODULE_COORDINATOR);
            userRepository.save(targetUser);
        }
    }

    private CourseResponse toResponse(Course course, User currentUser) {
        boolean canManage = permissionService.canManageCourse(currentUser, course.getId());
        return new CourseResponse(
                course.getId(), course.getCode(), course.getName(),
                course.getAcademicYear(), course.getSemesterNumber(),
                course.getBatch().getName(), canManage
        );
    }
}