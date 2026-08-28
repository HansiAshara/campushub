import { useEffect, useState } from "react";
import { resourceService } from "../../../api/resourceService";
import { type VoteSummary } from "../../../types";
import { ChevronUp, ChevronDown } from "lucide-react";

function VoteButtons({ resourceId }: { resourceId: number }) {
    const [summary, setSummary] = useState<VoteSummary | null>(null);

    useEffect(() => {
        resourceService.getVoteSummary(resourceId).then((res) => setSummary(res.data));
    }, [resourceId]);

    const vote = async (value: number) => {
        const res = await resourceService.vote(resourceId, value);
        setSummary(res.data);
    };

    if (!summary) return (
        <div className="vote-col">
            <div style={{ width: 20, height: 48, background: "#F3F4F6", borderRadius: 6 }} />
        </div>
    );

    const score = summary.upvotes - summary.downvotes;

    return (
        <div className="vote-col">
            <button
                onClick={() => vote(1)}
                className={`vote-btn up${summary.userVote === 1 ? " voted" : ""}`}
                title="Upvote"
            >
                <ChevronUp size={18} />
            </button>
            <span className="vote-score">{score}</span>
            <button
                onClick={() => vote(-1)}
                className={`vote-btn down${summary.userVote === -1 ? " voted" : ""}`}
                title="Downvote"
            >
                <ChevronDown size={18} />
            </button>
        </div>
    );
}

export default VoteButtons;