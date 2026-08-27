package com.campushub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BatchRequest {
    @NotBlank
    private String name;
    private int intakeYear;
}