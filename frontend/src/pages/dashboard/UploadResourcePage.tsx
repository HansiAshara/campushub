import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function UploadResourcePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [resourceType, setResourceType] = useState("KUPPI_NOTES");
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Attach a file to continue.");
            return;
        }
        setError("");
        setUploading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("resourceType", resourceType);
        formData.append("courseId", courseId!);
        formData.append("file", file);

        try {
            await api.post("/resources", formData, { headers: { "Content-Type": "multipart/form-data" } });
            navigate(`/dashboard/courses/${courseId}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "This file has already been shared for this course.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Header section */}
            <div style={{ marginBottom: 28 }}>
                <Link to={`/dashboard/courses/${courseId}`} style={{ fontSize: 13, color: "#64748B", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    ← Back to Course
                </Link>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", marginTop: 10, letterSpacing: "-0.02em" }}>
                    Share a Resource
                </h1>
                <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
                    Help your batch mates by uploading verified kuppi notes, tutes, or past papers.
                </p>
            </div>

            {/* Professional 2-Column Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
                {/* Main Form Container */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 16,
                        padding: "32px 36px",
                        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                    }}
                >
                    <form onSubmit={handleUpload}>
                        <Input
                            label="Resource Title"
                            type="text"
                            placeholder="e.g. ER Diagrams & Relational Algebra — Kuppi Notes"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#334155" }}>
                                Category / Resource Type
                            </label>
                            <select
                                value={resourceType}
                                onChange={(e) => setResourceType(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    border: "1px solid #E2E8F0",
                                    backgroundColor: "#FFFFFF",
                                    color: "#0F172A",
                                    fontSize: 14,
                                    fontFamily: "var(--font-body)",
                                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                    outline: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="KUPPI_NOTES">Kuppi Notes</option>
                                <option value="PAST_PAPER">Past Paper</option>
                                <option value="TUTE">Tutorial / Tute</option>
                                <option value="SLIDES">Lecture Slides</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#334155" }}>
                                Document File
                            </label>
                            <label
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                                }}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "40px 24px",
                                    border: `2px dashed ${dragActive ? "#4F46E5" : "#CBD5E1"}`,
                                    borderRadius: 14,
                                    backgroundColor: dragActive ? "#EEF2FF" : "#F8FAFC",
                                    cursor: "pointer",
                                    textAlign: "center",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} required />
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        backgroundColor: "#EEF2FF",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#4F46E5",
                                        fontSize: 22,
                                        marginBottom: 12,
                                    }}
                                >
                                    📁
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                                    {file ? file.name : "Click to browse or drag & drop file"}
                                </span>
                                <span style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                                    Supported formats: PDF, DOCX, PNG, JPG (Max 25MB)
                                </span>
                            </label>
                        </div>

                        {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</p>}

                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <Link to={`/dashboard/courses/${courseId}`}>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </Link>
                            <Button type="submit" variant="chalk" disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload Resource"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Info / Rules Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div
                        style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 16,
                            padding: "24px",
                            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                        }}
                    >
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <span>🛡️</span> Duplicate Protection Active
                        </h3>
                        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                            CampusHub automatically generates SHA-256 hashes for all uploaded files to prevent duplicate resources from clogging the batch folder.
                        </p>
                    </div>

                    <div
                        style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 16,
                            padding: "24px",
                            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                        }}
                    >
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <span>📌</span> Uploading Guidelines
                        </h3>
                        <ul style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                            <li>Ensure file title accurately describes contents (e.g. Include Topic / Year).</li>
                            <li>Avoid uploading copyrighted textbook PDFs.</li>
                            <li>Clean handwritten notes are preferred for kuppi summaries.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadResourcePage;