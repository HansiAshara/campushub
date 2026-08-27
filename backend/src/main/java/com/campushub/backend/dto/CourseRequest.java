package com.campushub.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @Min(1) @Max(4)
    private int academicYear;

    @Min(1) @Max(2)
    private int semesterNumber;

    @NotNull
    private Long batchId;
}