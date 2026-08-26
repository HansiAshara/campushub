import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

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
        <div style={{ maxWidth: 520 }}>
            <Link to={`/dashboard/courses/${courseId}`} style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Back</Link>
            <h1 style={{ fontSize: 26, margin: "10px 0 24px" }}>Share a resource</h1>

            <Card>
                <form onSubmit={handleUpload}>
                    <Input label="Title" type="text" placeholder="e.g. ER Diagrams — Kuppi Notes" value={title} onChange={(e) => setTitle(e.target.value)} required />

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-text-muted)" }}>Type</label>
                        <select
                            value={resourceType}
                            onChange={(e) => setResourceType(e.target.value)}
                            style={{ width: "100%", padding: "11px 12px", borderRadius: 6, border: "1px solid var(--color-border)", fontSize: 14, fontFamily: "var(--font-body)" }}
                        >
                            <option value="PAST_PAPER">Past Paper</option>
                            <option value="TUTE">Tute</option>
                            <option value="KUPPI_NOTES">Kuppi Notes</option>
                            <option value="SLIDES">Slides</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-text-muted)" }}>File</label>
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
                                padding: "28px 16px",
                                border: `1.5px dashed ${dragActive ? "var(--color-chalk)" : "var(--color-border)"}`,
                                borderRadius: 8,
                                backgroundColor: dragActive ? "#FBEFD1" : "#FAF8F2",
                                cursor: "pointer",
                                textAlign: "center",
                            }}
                        >
                            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} required />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>
                                {file ? file.name : "Drop a file here, or click to browse"}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>PDF, DOCX, or image</span>
                        </label>
                    </div>

                    {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

                    <Button type="submit" variant="chalk" fullWidth disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload Resource"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}

export default UploadResourcePage;