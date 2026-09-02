package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private String indexNo;
    private Long batchId;
    private String batchName;
    private Integer academicYear;
    private Long userId;
}