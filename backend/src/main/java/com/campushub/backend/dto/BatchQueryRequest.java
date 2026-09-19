package com.campushub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BatchQueryRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Message is required")
    private String message;
}
