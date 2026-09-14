import { useState, useEffect } from "react";
import { type Course } from "../../../../types";
import { courseService } from "../../../../api/courseService";
import { X, BookOpen } from "lucide-react";

interface LeaderEditCourseModalProps {
    course: Course | null;
    batchId: number | string;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderEditCourseModal({
    course,
    batchId,
    isOpen,
    onClose,
    onUpdated,
}: LeaderEditCourseModalProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [academicYear, setAcademicYear] = useState<number>(1);
    const [semesterNumber, setSemesterNumber] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (course) {
            setCode(course.code);
            setName(course.name);
            setAcademicYear(course.academicYear);
            setSemesterNumber(course.semesterNumber);
            setError("");
        }
    }, [course]);

    if (!isOpen || !course) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!code.trim() || !name.trim()) {
            setError("Please fill out all required fields.");
            return;
        }

        setLoading(true);
        try {
            await courseService.update(course.id, {
                code: code.trim().toUpperCase(),
                name: name.trim(),
                academicYear,
                semesterNumber,
                batchId: Number(batchId),
            });
            onUpdated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update course.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
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
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(13, 27, 42, 0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 16,
                fontFamily: font,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 24,
                    width: "100%",
                    maxWidth: 480,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                                Edit Course Module
                            </h3>
                            <div style={{ fontSize: 12, color: "#6B7280" }}>{course.code} · {course.batchName}</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#9CA3AF",
                            padding: 4,
                            borderRadius: 6,
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Course Code */}
                    <div>
                        <label style={labelStyle}>Course Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. IT3020"
                            required
                            style={inputStyle}
                        />
                    </div>

                    {/* Course Name */}
                    <div>
                        <label style={labelStyle}>Course Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Distributed Systems"
                            required
                            style={inputStyle}
                        />
                    </div>

                    {/* Year and Semester */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Academic Year</label>
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
                            <label style={labelStyle}>Semester</label>
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

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: "9px 18px",
                                borderRadius: 8,
                                border: "1px solid #D1D5DB",
                                background: "white",
                                color: "#374151",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                padding: "9px 22px",
                                fontSize: 13,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
