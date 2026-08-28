package com.campushub.backend.repository;

import com.campushub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByBatchIdAndRole(Long batchId, User.Role role);
}