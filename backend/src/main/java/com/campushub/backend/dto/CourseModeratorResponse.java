package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseModeratorResponse {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long batchId;
    private String batchName;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userIndexNo;
}
