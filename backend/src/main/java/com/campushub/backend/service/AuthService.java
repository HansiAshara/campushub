package com.campushub.backend.service;

import com.campushub.backend.dto.*;
import com.campushub.backend.entity.User;
import com.campushub.backend.entity.Batch;
import com.campushub.backend.repository.UserRepository;
import com.campushub.backend.repository.BatchRepository;
import com.campushub.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, BatchRepository batchRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "");
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIndexNo(request.getIndexNo() != null ? request.getIndexNo().trim() : null);
        user.setAcademicYear(request.getAcademicYear());

        if (request.getBatchId() != null) {
            Batch batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
            user.setBatch(batch);
        }

        // Assign ADMIN role if email is admin@uom.lk
        if ("admin@uom.lk".equalsIgnoreCase(email)) {
            user.setRole(User.Role.ADMIN);
        }

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getEmail());
        return toAuthResponse(token, savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return toAuthResponse(token, user);
    }

    private AuthResponse toAuthResponse(String token, User user) {
        Long batchId = user.getBatch() != null ? user.getBatch().getId() : null;
        String batchName = user.getBatch() != null ? user.getBatch().getName() : null;
        return new AuthResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getIndexNo(),
                batchId,
                batchName,
                user.getAcademicYear()
        );
    }
}