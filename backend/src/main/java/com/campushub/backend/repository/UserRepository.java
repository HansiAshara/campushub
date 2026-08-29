package com.campushub.backend.repository;

import com.campushub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.batch.id = :batchId AND u.role = :role")
    List<User> findByBatchIdAndRole(@Param("batchId") Long batchId, @Param("role") User.Role role);
}