package com.campushub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteSummaryResponse {
    private long upvotes;
    private long downvotes;
    private Integer userVote; // null if this user hasn't voted
}