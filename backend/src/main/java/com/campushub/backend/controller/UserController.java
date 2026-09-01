package com.campushub.backend.controller;

import com.campushub.backend.dto.AdminProfileUpdateRequest;
import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.BatchRepository;
import com.campushub.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;

    public UserController(UserRepository userRepository, BatchRepository batchRepository) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(toUserResponse(currentUser()));
    }

    @PutMapping("/admin/profile")
    public ResponseEntity<?> updateAdminProfile(@Valid @RequestBody AdminProfileUpdateRequest request) {
        User current = currentUser();
        if (current.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied: Only administrators can update admin student profile."));
        }

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        current.setBatch(batch);
        if (request.getAcademicYear() != null) {
            current.setAcademicYear(request.getAcademicYear());
        }
        if (request.getIndexNo() != null && !request.getIndexNo().trim().isEmpty()) {
            current.setIndexNo(request.getIndexNo().trim().toUpperCase());
        }
        User saved = userRepository.save(current);
        return ResponseEntity.ok(toUserResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam(required = false, defaultValue = "") String query) {
        String lowercaseQuery = query.toLowerCase();
        User current = currentUser();
        boolean isBatchLeader = current.getRole() == User.Role.BATCH_LEADER;

        List<UserResponse> users = userRepository.findAll().stream()
                .filter(u -> (u.getName() != null && u.getName().toLowerCase().contains(lowercaseQuery))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowercaseQuery))
                        || (u.getIndexNo() != null && u.getIndexNo().toLowerCase().contains(lowercaseQuery)))
                .filter(u -> !isBatchLeader || (u.getBatch() != null && current.getBatch() != null && u.getBatch().getId().equals(current.getBatch().getId())))
                .map(this::toUserResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    private UserResponse toUserResponse(User u) {
        Long batchId = u.getBatch() != null ? u.getBatch().getId() : null;
        String batchName = u.getBatch() != null ? u.getBatch().getName() : null;
        return new UserResponse(
                u.getId(), u.getName(), u.getEmail(), u.getRole().name(),
                u.getIndexNo(), batchId, batchName, u.getAcademicYear()
        );
    }
}
