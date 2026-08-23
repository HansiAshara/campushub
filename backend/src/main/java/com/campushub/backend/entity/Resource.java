package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String fileUrl;

    @Column(nullable = false)
    private String fileHash; // SHA-256, for duplicate detection

    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;

    @Column(columnDefinition = "TEXT")
    private String summary; // AI-generated, added later

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne     //many resources rows can belong to one Course and one User
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ResourceType {
        PAST_PAPER, TUTE, KUPPI_NOTES, SLIDES
    }
}