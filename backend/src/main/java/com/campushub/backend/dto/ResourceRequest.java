package com.campushub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    @NotBlank(message = "File hash is required")
    private String fileHash;

    @NotNull(message = "Resource type is required")
    private String resourceType; // PAST_PAPER, TUTE, KUPPI_NOTES, SLIDES

    @NotNull(message = "Course ID is required")
    private Long courseId;
}