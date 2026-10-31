import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { type Resource } from "../../../types";
import StarRating from "./StarRating";
import CommentSection from "./CommentSection";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { resourceService } from "../../../api/resourceService";
import { formatDate } from "../../../utils/dateUtils";
import { formatCategory } from "../../../utils/formatUtils";
import {
    FileText,
    MessageCircle,
    Edit2,
    Trash2,
    ExternalLink,
    Eye,
    Download,
    Loader2,
    Sparkles,
    RefreshCw,
    AlertCircle,
    Tag as TagIcon,
    ChevronDown,
    ChevronUp
} from "lucide-react";

interface Props {
    resource: Resource;
    onChanged: () => void;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
    onTagClick?: (tag: string) => void;
    activeTag?: string | null;
}

const RESOURCE_TYPE_STYLE: Record<string, { label: string; className: string }> = {
    KUPPI_NOTES: { label: "Kuppi Recordings", className: "kuppi" },
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

function ResourceItem({ resource, onChanged, selectable, selected, onToggleSelect, onTagClick, activeTag }: Props) {
    const [item, setItem] = useState<Resource>(resource);
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [title, setTitle] = useState(resource.title);
    const [resourceType, setResourceType] = useState(resource.resourceType);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [retryingAi, setRetryingAi] = useState(false);
    const [showFullSummary, setShowFullSummary] = useState(false);

    // Keep item in sync with incoming props
    useEffect(() => {
        setItem(resource);
        setTitle(resource.title);
        setResourceType(resource.resourceType);
    }, [resource]);

    // Polling when AI status is PENDING or PROCESSING
    useEffect(() => {
        if (item.aiStatus !== "PENDING" && item.aiStatus !== "PROCESSING") return;

        const interval = setInterval(async () => {
            try {
                const res = await resourceService.getById(item.id);
                if (res.data) {
                    setItem(res.data);
                    if (res.data.aiStatus !== "PENDING" && res.data.aiStatus !== "PROCESSING") {
                        onChanged();
                    }
                }
            } catch (err) {
                console.error("Failed to poll AI status:", err);
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [item.id, item.aiStatus, onChanged]);

    const handleRetryAi = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setRetryingAi(true);
        try {
            const res = await resourceService.reprocessAi(item.id);
            if (res.data) {
                setItem(res.data);
            }
        } catch (err) {
            console.error("Failed to retry AI processing:", err);
        } finally {
            setRetryingAi(false);
        }
    };

    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("userName");

    // Match ownership by userId or userName
    const isOwner = Boolean(
        (currentUserId && String(item.uploadedById) === String(currentUserId)) ||
        (currentUserName && item.uploadedByName && (
            item.uploadedByName.trim().toLowerCase() === currentUserName.trim().toLowerCase() ||
            item.uploadedByName.trim().toLowerCase().startsWith(currentUserName.trim().toLowerCase()) ||
            currentUserName.trim().toLowerCase().startsWith(item.uploadedByName.trim().toLowerCase())
        ))
    );

    // The backend evaluates permissions (Uploader, Coordinator, Admin) and returns canEdit = true
    const canModify = Boolean(item.canEdit);

    const saveEdit = async () => {
        setSaving(true);
        try {
            await resourceService.update(item.id, title, resourceType);
            setEditing(false);
            onChanged();
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        await resourceService.remove(item.id);
        setConfirmingDelete(false);
        onChanged();
    };

    const fileName = getResourceFileName(item.fileUrl, item.title);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!item.fileUrl) return;

        setDownloading(true);
        try {
            const response = await fetch(item.fileUrl);
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
            link.href = item.fileUrl;
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

    const typeInfo = RESOURCE_TYPE_STYLE[item.resourceType] || { label: formatCategory(item.resourceType), className: "" };

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

                {/* Main content */}
                <div style={{ flex: 1, padding: "18px 22px" }}>
                    {/* Header Row: Badges & Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                        {/* Badge row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span className="course-badge">{item.courseName?.split(" ")[0] || "COURSE"}</span>
                            <span className={`type-badge ${typeInfo.className}`}>{typeInfo.label.toUpperCase()}</span>

                            {/* AI Processing Status Badges */}
                            {(item.aiStatus === "PENDING" || item.aiStatus === "PROCESSING") && (
                                <span className="ai-status-pill pending" title="AI background processing in progress">
                                    <Sparkles size={11} className="spin-animation" />
                                    <span>AI analyzing document...</span>
                                </span>
                            )}

                            {item.aiStatus === "FAILED" && (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                    <span className="ai-status-pill failed" title="Document analysis was not completed">
                                        <AlertCircle size={11} />
                                        <span>AI summary unavailable</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRetryAi}
                                        disabled={retryingAi}
                                        className="ai-retry-btn"
                                        title="Retry AI extraction and summary"
                                    >
                                        <RefreshCw size={10} className={retryingAi ? "spin-animation" : ""} />
                                        <span>{retryingAi ? "Retrying..." : "Retry AI"}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Visible & User-Friendly View & Download Action Buttons */}
                        {item.fileUrl && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-view-resource"
                                    title="View or read resource in new tab"
                                >
                                    <Eye size={15} />
                                    <span>View</span>
                                </a>
                                {item.resourceType !== "KUPPI_NOTES" && (
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
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title and Rating */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                        <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 16, color: "#0D1B2A", transition: "color 0.12s", textDecoration: "none", fontFamily: "var(--font-display)" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#10B981")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0D1B2A")}
                            title="Open resource"
                        >
                            {item.title}
                            <ExternalLink size={13} color="#9CA3AF" />
                        </a>
                        <StarRating resourceId={item.id} />
                    </div>

                    {/* AI Summary Box */}
                    {item.summary && (
                        <div className="ai-summary-container">
                            <div className="ai-summary-header">
                                <div className="ai-summary-label">
                                    <Sparkles size={12} color="#10B981" />
                                    <span>AI Summary</span>
                                </div>
                                {item.summary.length > 220 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowFullSummary(!showFullSummary)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "#047857",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 2,
                                        }}
                                    >
                                        <span>{showFullSummary ? "Show less" : "Read more"}</span>
                                        {showFullSummary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                )}
                            </div>
                            <p className="ai-summary-text">
                                {showFullSummary || item.summary.length <= 220
                                    ? item.summary
                                    : `${item.summary.slice(0, 215)}...`}
                            </p>
                        </div>
                    )}

                    {/* AI Generated Topic Tags */}
                    {item.tags && item.tags.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                            {item.tags.map((tag) => {
                                const isSelected = activeTag?.toLowerCase() === tag.toLowerCase();
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => onTagClick?.(tag)}
                                        className={`tag-pill ${isSelected ? "active" : ""}`}
                                        title={`Filter by topic: #${tag}`}
                                    >
                                        <TagIcon size={10} />
                                        <span>#{tag}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Embedded Video Player */}
                    {item.resourceType === "KUPPI_NOTES" && item.fileUrl && (
                        <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#000' }}>
                            {/* @ts-ignore */}
                            <ReactPlayer url={item.fileUrl} width="100%" height="320px" controls light />
                        </div>
                    )}

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                        <a
                            href={item.fileUrl}
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
                            <span style={{ fontWeight: 500, color: "#374151" }}>{item.uploadedByName}</span>
                            {isOwner && (
                                <span className="badge-my-upload" title="You uploaded this resource">You</span>
                            )}
                            <span>·</span>
                            <span>{formatDate(item.createdAt)}</span>

                            {canModify && (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTitle(item.title);
                                            setResourceType(item.resourceType);
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
                    <CommentSection resourceId={item.id} />
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
                            <option value="KUPPI_NOTES">Kuppi Recordings</option>
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
                    Are you sure you want to delete <strong>"{item.title}"</strong>? This action cannot be undone.
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
