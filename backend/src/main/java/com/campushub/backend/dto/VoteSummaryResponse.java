package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteSummaryResponse {
    private double averageRating;
    private long totalRatings;
    private Integer userVote; // null if this user hasn't voted
}