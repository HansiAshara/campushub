package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchStatsResponse {
    private Long batchId;
    private String batchName;
    private long courseCount;
    private long resourceCount;
    private long myUploadCount;
}
