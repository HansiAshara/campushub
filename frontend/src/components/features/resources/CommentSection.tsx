import { useEffect, useState } from "react";
import { commentService } from "../../../api/commentService";
import { type Comment } from "../../../types";
import { formatShortDate } from "../../../utils/dateUtils";
import { Send, MessageCircle } from "lucide-react";

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
        <div style={{ marginTop: 12, borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <MessageCircle size={16} color="#10B981" />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                    Discussions
                </h4>
                <span style={{ background: "#ECFDF5", color: "#10B981", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                    {comments.length}
                </span>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                Ask questions, report issues, or discuss this resource with your batch.
            </p>

            {/* Comments list */}
            {comments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                    {comments.map((c) => (
                        <div key={c.id} style={{ display: "flex", gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0, boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)" }}>
                                {c.userName?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "0 12px 12px 12px", padding: "10px 14px", flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{c.userName}</span>
                                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatShortDate(c.createdAt)}</span>
                                </div>
                                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, wordBreak: "break-word" }}>{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "24px 16px", background: "#F9FAFB", borderRadius: 12, border: "1px dashed #E5E7EB", marginBottom: 20 }}>
                    <MessageCircle size={28} color="#D1D5DB" style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                        No comments yet. Be the first to start the discussion!
                    </p>
                </div>
            )}

            {/* Comment input */}
            <form onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write your message here..."
                        style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E7EB", borderRadius: 20, fontSize: 13, color: "#0D1B2A", outline: "none", background: "white", transition: "all 0.2s ease" }}
                        onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={posting || !text.trim()}
                    style={{ padding: "12px", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", opacity: (!text.trim() || posting) ? 0.6 : 1 }}
                >
                    <Send size={16} style={{ transform: "translateX(-1px) translateY(1px)" }} />
                </button>
            </form>
        </div>
    );
}

export default CommentSection;