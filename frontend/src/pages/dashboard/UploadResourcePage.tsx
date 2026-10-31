import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resourceService } from "../../api/resourceService";
import { type CleanedDocument } from "../../types";
import { ArrowLeft, UploadCloud, Fingerprint, Sparkles, Tag, AlertTriangle, Info } from "lucide-react";

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

    // AI Preprocessing Preview State (Step 1 & 2 Verification)
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<CleanedDocument | null>(null);
    const [showPreviewSnippet, setShowPreviewSnippet] = useState(false);

    const handleFileChange = (newFile: File | null) => {
        setFile(newFile);
        setPreviewData(null);
        setShowPreviewSnippet(false);
    };

    const handlePreviewExtraction = async () => {
        if (!file) return;
        setPreviewLoading(true);
        try {
            const res = await resourceService.previewPreprocess(file);
            setPreviewData(res.data);
        } catch (err: any) {
            console.error("Preview extraction failed", err);
            setError(err.response?.data?.message || "Failed to analyze document text.");
        } finally {
            setPreviewLoading(false);
        }
    };

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
                                        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]); }}
                                    >
                                        <input type="file" accept=".pdf,.docx,.pptx,.txt" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} style={{ display: "none" }} />
                                        <UploadCloud size={32} color={file ? "#10B981" : dragActive ? "#10B981" : "#9CA3AF"} style={{ marginBottom: 12, transition: "color 0.15s" }} />
                                        <span style={{ fontWeight: 600, fontSize: 14, color: file ? "#10B981" : "#0D1B2A" }}>
                                            {file ? file.name : "Drop a PDF, DOCX, PPTX, or TXT here, or click to browse"}
                                        </span>
                                        <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                                            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "Max 50 MB · Supported: PDF, DOCX, PPTX, TXT"}
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* AI Extraction & Preprocessing Verification Card */}
                            {file && resourceType !== "KUPPI_NOTES" && (
                                <div style={{ marginTop: -12, marginBottom: 24, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Sparkles size={16} color="#10B981" />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A" }}>
                                                    AI Text Extraction & Preprocessing Check
                                                </div>
                                                <div style={{ fontSize: 11, color: "#64748B" }}>
                                                    Test deterministic parsing, cleaning, and chunking (Steps 1 & 2)
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handlePreviewExtraction}
                                            disabled={previewLoading}
                                            style={{
                                                background: previewLoading ? "#9CA3AF" : "#0D1B2A",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "7px 14px",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: previewLoading ? "not-allowed" : "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                transition: "background 0.15s ease"
                                            }}
                                            onMouseEnter={(e) => { if (!previewLoading) e.currentTarget.style.background = "#10B981"; }}
                                            onMouseLeave={(e) => { if (!previewLoading) e.currentTarget.style.background = "#0D1B2A"; }}
                                        >
                                            <Sparkles size={13} color="white" />
                                            {previewLoading ? "Extracting & Cleaning..." : "Test Document Preprocessor"}
                                        </button>
                                    </div>

                                    {previewData && (
                                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E2E8F0", fontSize: 12 }}>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                                                <span style={{
                                                    background: previewData.hasSufficientContent ? "#ECFDF5" : "#FEF2F2",
                                                    color: previewData.hasSufficientContent ? "#059669" : "#DC2626",
                                                    border: `1px solid ${previewData.hasSufficientContent ? "#A7F3D0" : "#FECACA"}`,
                                                    padding: "3px 8px",
                                                    borderRadius: 6,
                                                    fontWeight: 600
                                                }}>
                                                    {previewData.hasSufficientContent ? "✓ Quality: Sufficient" : "⚠ Quality: Insufficient"}
                                                </span>
                                                <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: 6 }}>
                                                    Pages/Slides: {previewData.pageCount}
                                                </span>
                                                <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: 6 }}>
                                                    Cleaned Chars: {previewData.cleanedCharacterCount.toLocaleString()}
                                                </span>
                                                <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: 6 }}>
                                                    Words: {previewData.wordCount.toLocaleString()}
                                                </span>
                                                <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: 6 }}>
                                                    Chunks: {previewData.chunks.length}
                                                </span>
                                            </div>
                                            <div style={{ color: "#64748B", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                                <Info size={14} color="#64748B" />
                                                <span><strong>Status:</strong> {previewData.statusMessage}</span>
                                            </div>
                                            {previewData.cleanedText && (
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPreviewSnippet(!showPreviewSnippet)}
                                                        style={{ background: "none", border: "none", color: "#10B981", fontSize: 12, fontWeight: 600, padding: 0, cursor: "pointer", textDecoration: "underline" }}
                                                    >
                                                        {showPreviewSnippet ? "Hide Cleaned Text Preview" : "View Cleaned Text Preview"}
                                                    </button>
                                                    {showPreviewSnippet && (
                                                        <div style={{ marginTop: 8, padding: 10, background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 6, maxHeight: 180, overflowY: "auto", fontFamily: "monospace", fontSize: 11, whiteSpace: "pre-wrap", color: "#334155" }}>
                                                            {previewData.cleanedText.slice(0, 1000)}
                                                            {previewData.cleanedText.length > 1000 ? "\n\n[... truncated preview ...]" : ""}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
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

                            <button
                                type="submit"
                                disabled={uploading}
                                className="btn-primary"
                                style={{ width: "100%", padding: "14px 20px", fontSize: 15, justifyContent: "center" }}
                            >
                                {uploading ? "Publishing resource..." : "Add Resource"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── RIGHT — PROCESSING PIPELINE ── */}
                <div style={{ width: 340 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                            Automated Processing
                        </span>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#0D1B2A", marginBottom: 6 }}>
                            What happens next
                        </h2>
                        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, marginBottom: 24 }}>
                            Every resource passes through four steps before becoming discoverable.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            {pipelineSteps.map(({ Icon, color, bg, title: stepTitle, desc }, i) => (
                                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                        <Icon size={18} color={color} />
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>0{i + 1}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A" }}>{stepTitle}</span>
                                        </div>
                                        <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadResourcePage;
