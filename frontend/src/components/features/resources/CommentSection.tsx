import { useEffect, useState } from "react";
import { commentService } from "../../../api/commentService";
import { type Comment } from "../../../types";
import { formatShortDate } from "../../../utils/dateUtils";
import Button from "../../ui/Button";

function CommentSection({ resourceId }: { resourceId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);

    const load = () => commentService.getByResource(resourceId).then((res) => setComments(res.data));
    useEffect(void load, [resourceId]);

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
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
            {comments.map((c) => (
                <div key={c.id} style={{ marginBottom: 10, fontSize: 13 }}>
                    <strong>{c.userName}</strong>
                    <span style={{ color: "var(--color-text-muted)", marginLeft: 6 }}>{formatShortDate(c.createdAt)}</span>
                    <div style={{ marginTop: 2 }}>{c.content}</div>
                </div>
            ))}
            <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..."
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
                <Button type="submit" variant="ghost" disabled={posting} style={{ padding: "8px 14px" }}>Post</Button>
            </form>
        </div>
    );
}

export default CommentSection;