package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "course_moderators", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "user_id"})
})
@Data
public class CourseModerator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}