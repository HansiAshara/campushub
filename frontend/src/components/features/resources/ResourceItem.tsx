import { useState } from "react";
import { type Resource } from "../../../types";
import VoteButtons from "./VoteButtons";
import CommentSection from "./CommentSection";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { resourceService } from "../../../api/resourceService";
import { formatDate } from "../../../utils/dateUtils";
import { formatCategory } from "../../../utils/formatUtils";
import { FileText, MessageCircle, Edit2, Trash2, ExternalLink } from "lucide-react";

interface Props {
    resource: Resource;
    onChanged: () => void;
}

const RESOURCE_TYPE_STYLE: Record<string, { label: string; className: string }> = {
    KUPPI_NOTES: { label: "Kuppi", className: "kuppi" },
    PAST_PAPER: { label: "Past Paper", className: "past-paper" },
    TUTE: { label: "Tute", className: "tute" },
    NOTES: { label: "Notes", className: "" },
    SLIDES: { label: "Slides", className: "" },
};

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

    const typeInfo = RESOURCE_TYPE_STYLE[resource.resourceType] || { label: formatCategory(resource.resourceType), className: "" };

    return (
        <div className="resource-card fade-in" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
                {/* Vote column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", width: 56, flexShrink: 0, borderRight: "1px solid #F3F4F6" }}>
                    <VoteButtons resourceId={resource.id} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: "18px 22px" }}>
                    {/* Badge row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                        <span className="course-badge">{resource.courseName?.split(" ")[0] || "COURSE"}</span>
                        <span className={`type-badge ${typeInfo.className}`}>{typeInfo.label.toUpperCase()}</span>
                    </div>

                    {/* Title */}
                    <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 16, color: "#0D1B2A", transition: "color 0.12s", textDecoration: "none", fontFamily: "var(--font-display)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#10B981")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0D1B2A")}
                    >
                        {resource.title}
                        <ExternalLink size={13} color="#9CA3AF" />
                    </a>

                    {/* AI Summary */}
                    {resource.summary && (
                        <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, marginTop: 8, maxWidth: 680 }}>
                            ✨ {resource.summary}
                        </p>
                    )}

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                        <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280", textDecoration: "none", transition: "color 0.12s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#10B981")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6B7280")}
                        >
                            <FileText size={12} />
                            <span>{resource.fileUrl?.split("/").pop()?.slice(37) || "document.pdf"}</span>
                        </a>

                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: expanded ? "#10B981" : "#9CA3AF", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.12s" }}
                        >
                            <MessageCircle size={12} />
                            <span>Discussions</span>
                        </button>

                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9CA3AF" }}>
                            <span>{resource.uploadedByName}</span>
                            <span>·</span>
                            <span>{formatDate(resource.createdAt)}</span>

                            {resource.canEdit && (
                                <>
                                    <button
                                        onClick={() => setEditing(true)}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#D1D5DB", transition: "color 0.12s", borderRadius: 4 }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#10B981")}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#D1D5DB")}
                                        title="Edit"
                                    >
                                        <Edit2 size={13} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmingDelete(true)}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#D1D5DB", transition: "color 0.12s", borderRadius: 4 }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#EF4444")}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#D1D5DB")}
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comment section */}
            {expanded && (
                <div style={{ borderTop: "1px solid #F3F4F6", padding: "16px 22px 16px 78px", background: "#FAFAFA" }}>
                    <CommentSection resourceId={resource.id} />
                </div>
            )}

            {/* Edit Modal */}
            <Modal open={editing} onClose={() => setEditing(false)} title="Edit Resource">
                <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                    <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Delete Resource">
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
                    Are you sure you want to delete <strong>"{resource.title}"</strong>? This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                    <button className="btn-secondary" onClick={() => setConfirmingDelete(false)}>Cancel</button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}

export default ResourceItem;