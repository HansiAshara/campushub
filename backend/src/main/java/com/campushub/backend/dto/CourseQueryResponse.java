package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CourseQueryResponse {
    private Long id;
    private Long courseId;
    private String studentName;
    private String studentIndexNo;
    private String category;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
