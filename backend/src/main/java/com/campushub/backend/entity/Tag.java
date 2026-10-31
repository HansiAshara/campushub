package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Normalized relational entity representing an academic topic or tag.
 * <p>
 * Ensures topics like "TCP", "tcp", and "Tcp" share a single normalized entity,
 * avoiding duplicate tag entries and enabling cross-resource semantic queries.
 */
@Entity
@Table(name = "tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Display name with appropriate capitalization (e.g. "TCP", "Congestion Control").
     */
    @Column(nullable = false, length = 60)
    private String name;

    /**
     * Normalized lowercase representation used as a unique index (e.g. "tcp", "congestion control").
     */
    @Column(nullable = false, unique = true, length = 60)
    private String normalizedName;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Tag(String name, String normalizedName) {
        this.name = name;
        this.normalizedName = normalizedName;
        this.createdAt = LocalDateTime.now();
    }
}

