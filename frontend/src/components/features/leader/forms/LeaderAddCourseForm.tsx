import { useState } from "react";
import { courseService } from "../../../../api/courseService";
import { BookOpen, Plus, CheckCircle } from "lucide-react";

interface LeaderAddCourseFormProps {
    batchId: number | string;
    batchName: string;
    onCourseCreated: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderAddCourseForm({
    batchId,
    batchName,
    onCourseCreated,
}: LeaderAddCourseFormProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [academicYear, setAcademicYear] = useState<number>(1);
    const [semesterNumber, setSemesterNumber] = useState<number>(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!code.trim() || !name.trim()) {
            setError("Please fill out all required fields.");
            return;
        }

        if (!batchId) {
            setError("No batch ID found. You must be assigned to a batch to add courses.");
            return;
        }

        setLoading(true);
        try {
            await courseService.create({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                academicYear,
                semesterNumber,
                batchId: Number(batchId),
            });

            setSuccessMessage(`Module "${code.trim().toUpperCase()} - ${name.trim()}" created successfully!`);
            setCode("");
            setName("");
            setAcademicYear(1);
            setSemesterNumber(1);
            onCourseCreated();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create course module.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "11px 14px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 14,
        fontFamily: font,
        color: "#0D1B2A",
        outline: "none",
        background: "white",
        boxSizing: "border-box",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontFamily: font,
        fontSize: 11,
        fontWeight: 700,
        color: "#6B7280",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: 6,
    };

    return (
        <div
            style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 24,
                fontFamily: font,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#EFF6FF",
                        color: "#2563EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <BookOpen size={18} />
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D1B2A", margin: 0 }}>
                        Create New Course Module
                    </h3>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                        Register an academic module for <strong>{batchName || "your batch"}</strong>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: 13, color: "#6B7280", margin: "14px 0 20px 0" }}>
                Add new courses or modules for your batch. Students enrolled in this batch will be able to browse materials, upload tutorials, and participate in discussion threads.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Batch Information (Read-only / Pre-locked) */}
                <div>
                    <label style={labelStyle}>Batch Assignment</label>
                    <div
                        style={{
                            ...inputStyle,
                            background: "#F9FAFB",
                            color: "#4B5563",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <span>{batchName || "Your Batch"}</span>
                        <span style={{ fontSize: 11, background: "#ECFDF5", color: "#065F46", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                            Locked to Your Batch
                        </span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                    {/* Course Code */}
                    <div>
                        <label style={labelStyle}>Course Code *</label>
                        <input
                            type="text"
                            placeholder="e.g. IT3020"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {/* Course Name */}
                    <div>
                        <label style={labelStyle}>Course Title *</label>
                        <input
                            type="text"
                            placeholder="e.g. Distributed Systems"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Academic Year and Semester */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                        <label style={labelStyle}>Academic Year *</label>
                        <select
                            value={academicYear}
                            onChange={(e) => {
                                const newYear = Number(e.target.value);
                                setAcademicYear(newYear);
                                setSemesterNumber((newYear - 1) * 2 + 1);
                            }}
                            style={inputStyle}
                        >
                            <option value={1}>Year 1</option>
                            <option value={2}>Year 2</option>
                            <option value={3}>Year 3</option>
                            <option value={4}>Year 4</option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Semester Number *</label>
                        <select
                            value={semesterNumber}
                            onChange={(e) => setSemesterNumber(Number(e.target.value))}
                            style={inputStyle}
                        >
                            <option value={(academicYear - 1) * 2 + 1}>Semester {(academicYear - 1) * 2 + 1}</option>
                            <option value={(academicYear - 1) * 2 + 2}>Semester {(academicYear - 1) * 2 + 2}</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#065F46", display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle size={16} color="#10B981" />
                        {successMessage}
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            padding: "11px 24px",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        <Plus size={15} />
                        {loading ? "Creating Module..." : "Create Course Module"}
                    </button>
                </div>
            </form>
        </div>
    );
}
