import { useEffect, useState } from "react";
import { commentService } from "../../../api/commentService";
import { type Comment } from "../../../types";
import { formatShortDate } from "../../../utils/dateUtils";
import { Send } from "lucide-react";

function CommentSection({ resourceId }: { resourceId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);

    const load = () => {
        commentService.getByResource(resourceId).then((res) => setComments(res.data));
    };

    useEffect(() => {
        load();
    }, [resourceId]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setPosting(true);
        try {
            await commentService.add(resourceId, text);
            setText("");
            load();
        } finally {
            setPosting(false);
        }
    };

    return (
        <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 12 }}>
                Discussions ({comments.length})
            </h4>

            {/* Comments list */}
            {comments.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 240, overflowY: "auto" }}>
                    {comments.map((c) => (
                        <div key={c.id} style={{ display: "flex", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                                {c.userName?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div style={{ background: "white", border: "1px solid #F3F4F6", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 12, color: "#0D1B2A" }}>{c.userName}</span>
                                    <span style={{ fontSize: 11, color: "#D1D5DB" }}>{formatShortDate(c.createdAt)}</span>
                                </div>
                                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {comments.length === 0 && (
                <p style={{ fontSize: 13, color: "#D1D5DB", marginBottom: 12, fontStyle: "italic" }}>
                    No comments yet. Be the first to start the discussion.
                </p>
            )}

            {/* Comment input */}
            <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add to the discussion..."
                    style={{ flex: 1, padding: "9px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#0D1B2A", outline: "none", background: "white", transition: "border-color 0.15s" }}
                    onFocus={(e) => (e.target.style.borderColor = "#10B981")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={posting || !text.trim()}
                    style={{ padding: "9px 16px", fontSize: 13 }}
                >
                    <Send size={13} />
                    {posting ? "..." : "Post"}
                </button>
            </form>
        </div>
    );
}

export default CommentSection;