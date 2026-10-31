package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
    private String summary; // AI-generated summary

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AiStatus aiStatus = AiStatus.PENDING;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "resource_tags",
        joinColumns = @JoinColumn(name = "resource_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne     //many resources rows can belong to one Course and one User
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ResourceType {
        PAST_PAPER, TUTE, KUPPI_NOTES, SLIDES, NOTES
    }

    public enum AiStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, SKIPPED
    }
}
