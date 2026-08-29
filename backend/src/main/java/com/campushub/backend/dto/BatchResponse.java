package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchResponse {
    private Long id;
    private String name;
    private int intakeYear;
    private Long leaderId;
    private String leaderName;
    private String leaderEmail;
    private String leaderIndexNo;
    private long studentCount;
    private long courseCount;

    public BatchResponse(Long id, String name, int intakeYear) {
        this.id = id;
        this.name = name;
        this.intakeYear = intakeYear;
    }
}