package com.campushub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceUpdateRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String resourceType;
}