package com.campushub.backend.controller;

import com.campushub.backend.dto.UserResponse;
import com.campushub.backend.entity.User;
import com.campushub.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
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
