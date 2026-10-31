package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private String title;
    private String fileUrl;
    private String resourceType;
    private String summary;
    private String courseName;
    private String uploadedByName;
    private Long uploadedById;
    private LocalDateTime createdAt;
    private boolean canEdit;
    private String aiStatus;
    private List<String> tags;

    // Backward-compatible constructor
    public ResourceResponse(Long id, String title, String fileUrl, String resourceType, String summary,
                            String courseName, String uploadedByName, Long uploadedById,
                            LocalDateTime createdAt, boolean canEdit) {
        this(id, title, fileUrl, resourceType, summary, courseName, uploadedByName, uploadedById, createdAt, canEdit, "PENDING", List.of());
    }
}
