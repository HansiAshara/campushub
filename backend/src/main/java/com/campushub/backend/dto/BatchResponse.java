package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BatchResponse {
    private Long id;
    private String name;
    private int intakeYear;
}