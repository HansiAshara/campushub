package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "resource_id"})
})
//uniqueConstraints: enforces at the database level that one user can only have 
// one vote per resource — prevents duplicate voting even if there's a bug in your service logic later.


@Data
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int value; // +1 or -1

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;
}