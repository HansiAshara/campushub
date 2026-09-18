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
import { FileText, MessageCircle, Edit2, Trash2, ExternalLink, Eye, Download, Loader2 } from "lucide-react";

interface Props {
    resource: Resource;
    onChanged: () => void;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
}

const RESOURCE_TYPE_STYLE: Record<string, { label: string; className: string }> = {
    KUPPI_NOTES: { label: "Kuppi", className: "kuppi" },
    PAST_PAPER: { label: "Past Paper", className: "past-paper" },
    TUTE: { label: "Tute", className: "tute" },
    NOTES: { label: "Notes", className: "" },
    SLIDES: { label: "Slides", className: "" },
};

function getResourceFileName(fileUrl?: string, title?: string): string {
    if (!fileUrl) return `${title || "document"}.pdf`;
    try {
        const raw = fileUrl.split("?")[0].split("/").pop() || "";
        // Supabase uploads format: [UUID]-[originalFilename]
        if (raw.length > 37 && raw.charAt(36) === "-") {
            return decodeURIComponent(raw.slice(37));
        }
        return decodeURIComponent(raw) || `${title || "resource"}.pdf`;
    } catch {
        return `${title || "resource"}.pdf`;
    }
}

function ResourceItem({ resource, onChanged, selectable, selected, onToggleSelect }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [title, setTitle] = useState(resource.title);
    const [resourceType, setResourceType] = useState(resource.resourceType);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");
    //const currentRole = localStorage.getItem("role");

    // Match ownership by userId or userName
    const isOwner = Boolean(
        (currentUserId && String(resource.uploadedById) === String(currentUserId)) ||
        (currentUserName && resource.uploadedByName && (
            resource.uploadedByName.trim().toLowerCase() === currentUserName.trim().toLowerCase() ||
            resource.uploadedByName.trim().toLowerCase().startsWith(currentUserName.trim().toLowerCase()) ||
            currentUserName.trim().toLowerCase().startsWith(resource.uploadedByName.trim().toLowerCase())
        ))
    );

    // The backend evaluates permissions (Uploader, Coordinator, Admin) and returns canEdit = true
    const canModify = Boolean(resource.canEdit);

    const saveEdit = async () => {
        setSaving(true);
        try {
            await resourceService.update(resource.id, title, resourceType);
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

    const fileName = getResourceFileName(resource.fileUrl, resource.title);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!resource.fileUrl) return;

        setDownloading(true);
        try {
            const response = await fetch(resource.fileUrl);
            if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
            console.warn("Direct blob download failed, falling back to anchor trigger:", err);
            const link = document.createElement("a");
            link.href = resource.fileUrl;
            link.download = fileName;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setDownloading(false);
        }
    };

    const typeInfo = RESOURCE_TYPE_STYLE[resource.resourceType] || { label: formatCategory(resource.resourceType), className: "" };

    return (
        <div className="resource-card fade-in" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
                {/* Select column */}
                {selectable && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px 0 20px" }}>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={onToggleSelect}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                    </div>
                )}

                {/* Vote column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", width: selectable ? 46 : 56, flexShrink: 0, borderRight: "1px solid #F3F4F6" }}>
                    <VoteButtons resourceId={resource.id} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: "18px 22px" }}>
                    {/* Header Row: Badges & Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                        {/* Badge row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span className="course-badge">{resource.courseName?.split(" ")[0] || "COURSE"}</span>
                            <span className={`type-badge ${typeInfo.className}`}>{typeInfo.label.toUpperCase()}</span>
                        </div>

                        {/* Visible & User-Friendly View & Download Action Buttons */}
                        {resource.fileUrl && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <a
                                    href={resource.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-view-resource"
                                    title="View or read resource in new tab"
                                >
                                    <Eye size={15} />
                                    <span>View</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="btn-download-resource"
                                    title="Download resource file"
                                >
                                    {downloading ? (
                                        <>
                                            <Loader2 size={15} className="spin-animation" />
                                            <span>Downloading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download size={15} />
                                            <span>Download</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 16, color: "#0D1B2A", transition: "color 0.12s", textDecoration: "none", fontFamily: "var(--font-display)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#10B981")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0D1B2A")}
                        title="Open resource"
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
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#4B5563", textDecoration: "none", transition: "color 0.12s", background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "3px 8px", borderRadius: 6 }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#10B981")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#4B5563")}
                            title={`Open ${fileName}`}
                        >
                            <FileText size={12} />
                            <span style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {fileName}
                            </span>
                        </a>

                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                color: expanded ? "#047857" : "#10B981",
                                background: expanded ? "#D1FAE5" : "#ECFDF5",
                                border: expanded ? "1px solid #6EE7B7" : "1px solid #A7F3D0",
                                padding: "4px 12px",
                                borderRadius: 16,
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#D1FAE5";
                                e.currentTarget.style.borderColor = "#6EE7B7";
                            }}
                            onMouseLeave={(e) => {
                                if (!expanded) {
                                    e.currentTarget.style.background = "#ECFDF5";
                                    e.currentTarget.style.borderColor = "#A7F3D0";
                                }
                            }}
                        >
                            <MessageCircle size={14} style={{ fill: expanded ? "currentColor" : "none" }} />
                            <span>{expanded ? "Close Discussion" : "Discussions"}</span>
                        </button>

                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 500, color: "#374151" }}>{resource.uploadedByName}</span>
                            {isOwner && (
                                <span className="badge-my-upload" title="You uploaded this resource">You</span>
                            )}
                            <span>·</span>
                            <span>{formatDate(resource.createdAt)}</span>

                            {canModify && (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTitle(resource.title);
                                            setResourceType(resource.resourceType);
                                            setEditing(true);
                                        }}
                                        className="btn-resource-edit"
                                        title="Edit this resource"
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingDelete(true)}
                                        className="btn-resource-delete"
                                        title="Delete this resource"
                                    >
                                        <Trash2 size={12} />
                                        <span>Delete</span>
                                    </button>
                                </div>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Input
                        label="Resource Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter resource title"
                    />
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                            Resource Type
                        </label>
                        <select
                            value={resourceType}
                            onChange={(e) => setResourceType(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "9px 12px",
                                borderRadius: 8,
                                border: "1px solid #D1D5DB",
                                fontSize: 14,
                                color: "#111827",
                                background: "#FFFFFF",
                                outline: "none",
                                cursor: "pointer",
                            }}
                        >
                            <option value="NOTES">Notes</option>
                            <option value="PAST_PAPER">Past Paper</option>
                            <option value="TUTE">Tute</option>
                            <option value="KUPPI_NOTES">Kuppi</option>
                            <option value="SLIDES">Slides</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                    <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn-primary" onClick={saveEdit} disabled={saving || !title.trim()}>
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