import { useEffect, useState } from "react";
import { resourceService } from "../../../api/resourceService";
import { type VoteSummary } from "../../../types";
import { Star } from "lucide-react";

function StarRating({ resourceId }: { resourceId: number }) {
    const [summary, setSummary] = useState<VoteSummary | null>(null);
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    useEffect(() => {
        resourceService.getVoteSummary(resourceId).then((res) => setSummary(res.data));
    }, [resourceId]);

    const rate = async (value: number) => {
        const res = await resourceService.vote(resourceId, value);
        setSummary(res.data);
    };

    if (!summary) return (
        <div className="star-rating skeleton">
            <div style={{ width: 120, height: 24, background: "#F3F4F6", borderRadius: 4 }} />
        </div>
    );

    return (
        <div className="star-rating" onMouseLeave={() => setHoverValue(null)}>
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverValue !== null ? star <= hoverValue : star <= (summary.userVote || 0));
                    return (
                        <button
                            key={star}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                rate(star);
                            }}
                            onMouseEnter={() => setHoverValue(star)}
                            className={`star-btn ${isFilled ? "filled" : ""}`}
                            title={`Rate ${star} stars`}
                        >
                            <Star size={16} fill={isFilled ? "currentColor" : "none"} />
                        </button>
                    );
                })}
            </div>
            <span className="rating-text">
                {summary.averageRating > 0 ? (
                    <>
                        <strong>{summary.averageRating.toFixed(1)}</strong>{" "}
                        <span className="text-muted">
                            ({summary.totalRatings} {summary.totalRatings === 1 ? "rating" : "ratings"})
                        </span>
                    </>
                ) : (
                    <span className="text-muted">No ratings</span>
                )}
            </span>
        </div>
    );
}

export default StarRating;
