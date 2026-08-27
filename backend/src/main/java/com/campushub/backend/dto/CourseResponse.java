package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String code;
    private String name;
    private int academicYear;
    private int semesterNumber;
    private String batchName;
    private boolean canManage;
}