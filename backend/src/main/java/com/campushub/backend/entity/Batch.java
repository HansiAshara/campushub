package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "batches")
@Data
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Batch 23"

    private int intakeYear; // e.g. 2023
}