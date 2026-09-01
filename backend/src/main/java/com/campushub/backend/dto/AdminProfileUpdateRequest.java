package com.campushub.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminProfileUpdateRequest {
    @NotNull(message = "Batch ID is required")
    private Long batchId;

    private Integer academicYear;

    private String indexNo;
}
