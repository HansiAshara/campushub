package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"code", "batch_id"})
})
@Data
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // e.g. "IN2340"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int academicYear; // 1-4

    @Column(nullable = false)
    private int semesterNumber; // 1 or 2

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;
}