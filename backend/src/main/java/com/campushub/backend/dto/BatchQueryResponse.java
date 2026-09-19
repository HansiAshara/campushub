package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BatchQueryResponse {
    private Long id;
    private Long batchId;
    private String studentName;
    private String studentIndexNo;
    private String category;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
