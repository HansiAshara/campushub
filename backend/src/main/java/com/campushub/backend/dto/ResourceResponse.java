package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private String title;
    private String fileUrl;
    private String resourceType;
    private String summary;
    private String courseName;
    private String uploadedByName;
    private LocalDateTime createdAt;
}