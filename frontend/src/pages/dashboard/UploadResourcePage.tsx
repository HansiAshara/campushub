import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resourceService } from "../../api/resourceService";
import { ArrowLeft, UploadCloud, Fingerprint, Sparkles, GitMerge, Tag, AlertTriangle } from "lucide-react";

const RESOURCE_TYPES = [
    { key: "KUPPI_NOTES", label: "Kuppi Recordings" },
    { key: "PAST_PAPER", label: "Past Paper" },
    { key: "TUTE", label: "Tute" },
    { key: "NOTES", label: "Lecture Notes" },
    { key: "SLIDES", label: "Slides" },
];

function UploadResourcePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [resourceType, setResourceType] = useState("KUPPI_NOTES");
    const [file, setFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (resourceType === "KUPPI_NOTES") {
            if (!linkUrl.trim()) { setError("Please enter a valid video link."); return; }
        } else {
            if (!file) { setError("Attach a file to continue."); return; }
        }
        
        setError("");
        setUploading(true);

        try {
            if (resourceType === "KUPPI_NOTES") {
                await resourceService.uploadLink(title, resourceType, courseId!, linkUrl.trim());
            } else {
                const formData = new FormData();
                formData.append("title", title);
                formData.append("resourceType", resourceType);
                formData.append("courseId", courseId!);
                formData.append("file", file!);
                await resourceService.upload(formData);
            }
            navigate(`/dashboard/courses/${courseId}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "This resource has already been shared for this course.");
        } finally {
            setUploading(false);
        }
    };

    const pipelineSteps = [
        { Icon: Fingerprint, color: "#10B981", bg: "#ECFDF5", title: "SHA-256 exact match", desc: "No identical file found — proceeding with creation." },
        { Icon: AlertTriangle, color: "#F59E0B", bg: "#FEF3C7", title: "Near-duplicate similarity", desc: "File will be checked for cosine similarity with existing resources." },
        { Icon: Sparkles, color: "#8B5CF6", bg: "#F5F3FF", title: "Summarisation", desc: "Text will be extracted and a 3-sentence summary drafted." },
        { Icon: Tag, color: "#3B82F6", bg: "#EFF6FF", title: "Topic tagging", desc: "Suggested tags will be generated from content." },
    ];

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px" }}>
            {/* Breadcrumb */}
            <Link to={`/dashboard/courses/${courseId}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", marginBottom: 28 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
                <ArrowLeft size={14} />
                Back to Course
            </Link>

            {/* Page header */}
            <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#10B981", textTransform: "uppercase" }}>Contribute</span>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#0D1B2A", marginTop: 6, marginBottom: 8 }}>
                    Add a resource
                </h1>
                <p style={{ fontSize: 14, color: "#6B7280", maxWidth: 480 }}>
                    Files are scoped to a batch, academic year, semester and course so nobody has to guess which folder it belongs in.
                </p>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                {/* ── LEFT — FORM ── */}
                <div style={{ flex: 1 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28 }}>
                        <form onSubmit={handleUpload}>
                            {/* Drop zone */}
                            {resourceType === "KUPPI_NOTES" ? (
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8 }}>
                                        Video Link (YouTube, Google Drive, etc.)
                                    </label>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        required
                                        style={{ width: "100%", padding: "11px 16px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, color: "#0D1B2A", outline: "none", transition: "border-color 0.15s" }}
                                        onFocus={(e) => (e.target.style.borderColor = "#10B981")}
                                        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                                    />
                                </div>
                            ) : (
                                <div style={{ marginBottom: 24 }}>
                                    <label
                                        className={`drop-zone${dragActive ? " active" : ""}`}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 24px", cursor: "pointer" }}
                                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
                                    >
                                        <input type="file" accept=".pdf,.docx,.pptx,.jpg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                        <UploadCloud size={32} color={file ? "#10B981" : dragActive ? "#10B981" : "#9CA3AF"} style={{ marginBottom: 12, transition: "color 0.15s" }} />
                                        <span style={{ fontWeight: 600, fontSize: 14, color: file ? "#10B981" : "#0D1B2A" }}>
                                            {file ? file.name : "Drop a PDF here, or click to browse"}
                                        </span>
                                        <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                                            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "Max 50 MB · stored with signed URLs"}
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Title */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8 }}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. B-Tree Indexing Kuppi Recording — Finals Pack"
                                    required
                                    style={{ width: "100%", padding: "11px 16px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, color: "#0D1B2A", outline: "none", transition: "border-color 0.15s" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#10B981")}
                                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                                />
                            </div>

                            {/* Resource type pills */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10 }}>
                                    Resource Type
                                </label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {RESOURCE_TYPES.map(({ key, label }) => (
                                        <button
                                            type="button"
                                            key={key}
                                            onClick={() => setResourceType(key)}
                                            className={`filter-pill${resourceType === key ? " active" : ""}`}
                                            style={{ fontSize: 13 }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                    <AlertTriangle size={15} />
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <button type="submit" className="btn-primary" disabled={uploading} style={{ padding: "11px 28px", fontSize: 14 }}>
                                    {uploading ? "Uploading..." : "Publish resource"}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => navigate(`/dashboard/courses/${courseId}`)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── RIGHT — PROCESSING PIPELINE ── */}
                <div style={{ width: 320, flexShrink: 0 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0D1B2A", marginBottom: 4 }}>Processing pipeline</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
                            Runs server-side the moment the file stream arrives.
                        </div>

                        {pipelineSteps.map(({ Icon, color, bg, title: stepTitle, desc }) => (
                            <div key={stepTitle} className="pipeline-step">
                                <div className="pipeline-icon" style={{ background: bg }}>
                                    <Icon size={15} color={color} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0D1B2A" }}>{stepTitle}</div>
                                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
                                </div>
                            </div>
                        ))}

                        {/* Is this an updated version? card */}
                        <div style={{ marginTop: 20, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: 16 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0D1B2A", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                <GitMerge size={14} color="#F59E0B" />
                                Is this an updated version?
                            </div>
                            <p style={{ fontSize: 12, color: "#78350F", lineHeight: 1.5, marginBottom: 14 }}>
                                Linking attaches your file to an existing version thread instead of creating a disconnected entry.
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn-primary" style={{ fontSize: 12, padding: "7px 14px" }}>
                                    <GitMerge size={12} />
                                    Link as v3
                                </button>
                                <button className="btn-secondary" style={{ fontSize: 12, padding: "7px 14px" }}>
                                    Keep separate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadResourcePage;