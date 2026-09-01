package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {      //use User instead of users for class name to avoid conflicts 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = true, unique = true)
    private String indexNo;

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = true)
    private Batch batch;

    @Column(nullable = true)
    private Integer academicYear;

    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        STUDENT, BATCH_LEADER, MODULE_COORDINATOR, ADMIN
    }
}