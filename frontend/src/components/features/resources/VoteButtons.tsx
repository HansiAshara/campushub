import { useEffect, useState } from "react";
import { resourceService } from "../../../api/resourceService";
import { type VoteSummary } from "../../../types";

function VoteButtons({ resourceId }: { resourceId: number }) {
    const [summary, setSummary] = useState<VoteSummary | null>(null);

    useEffect(() => {
        resourceService.getVoteSummary(resourceId).then((res) => setSummary(res.data));
    }, [resourceId]);

    const vote = async (value: number) => {
        const res = await resourceService.vote(resourceId, value);
        setSummary(res.data);
    };

    if (!summary) return null;
    const score = summary.upvotes - summary.downvotes;
    const btnStyle = (active: boolean, color: string) => ({ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: active ? color : "var(--color-text-muted)", padding: 2 });

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => vote(1)} style={btnStyle(summary.userVote === 1, "var(--color-primary)")}>▲</button>
            <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{score}</span>
            <button onClick={() => vote(-1)} style={btnStyle(summary.userVote === -1, "var(--color-error)")}>▼</button>
        </div>
    );
}

export default VoteButtons;