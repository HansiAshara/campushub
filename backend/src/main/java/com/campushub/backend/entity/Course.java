package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "IT2050"

    @Column(nullable = false)
    private String name; // e.g. "Database Systems"

    private String semester; // e.g. "Year 2 Sem 1"
}