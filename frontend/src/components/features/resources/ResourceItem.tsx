import { useState } from "react";
import { type Resource } from "../../../types";
import Badge from "../../ui/Badge";
import VoteButtons from "./VoteButtons";
import CommentSection from "./CommentSection";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { resourceService } from "../../../api/resourceService";
import { formatDate } from "../../../utils/dateUtils";
import { formatCategory } from "../../../utils/formatUtils";

interface Props {
    resource: Resource;
    onChanged: () => void;
}

function ResourceItem({ resource, onChanged }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [title, setTitle] = useState(resource.title);
    const [saving, setSaving] = useState(false);

    const saveEdit = async () => {
        setSaving(true);
        try {
            await resourceService.update(resource.id, title, resource.resourceType);
            setEditing(false);
            onChanged();
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        await resourceService.remove(resource.id);
        setConfirmingDelete(false);
        onChanged();
    };

    return (
        <div className="fade-in" style={{ backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <VoteButtons resourceId={resource.id} />

                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text)" }}>
                        📄 {resource.title}
                    </a>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                        Uploaded by <strong>{resource.uploadedByName}</strong> · {formatDate(resource.createdAt)} · {expanded ? "Hide" : "Show"} comments
                    </div>
                </div>

                <Badge tone="accent">{formatCategory(resource.resourceType)}</Badge>

                {resource.canEdit && (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-text-muted)" }}>✎</button>
                        <button onClick={() => setConfirmingDelete(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-error)" }}>🗑</button>
                    </div>
                )}
            </div>

            {expanded && <CommentSection resourceId={resource.id} />}

            <Modal open={editing} onClose={() => setEditing(false)} title="Edit resource">
                <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button variant="primary" onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </div>
            </Modal>

            <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Delete this resource?">
                <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16 }}>This can't be undone.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}

export default ResourceItem;