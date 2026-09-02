import { useState, useEffect } from "react";
import { courseService } from "../../../../api/courseService";
import { type Batch } from "../../../../types";
import { getBatchAcademicYear } from "../../../../utils/batchUtils";
import { BookPlus, CheckCircle2 } from "lucide-react";

interface AddCourseFormProps {
    batches: Batch[];
    onCourseCreated?: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AddCourseForm({ batches, onCourseCreated }: AddCourseFormProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [academicYear, setAcademicYear] = useState<number>(1);
    const [semesterNumber, setSemesterNumber] = useState<number>(1);
    const [batchId, setBatchId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const currentRole = localStorage.getItem("role") || "STUDENT";
    const myBatchId = localStorage.getItem("batchId");

    useEffect(() => {
        if (batches.length > 0 && !batchId) {
            if (myBatchId && batches.some((b) => b.id.toString() === myBatchId.toString())) {
                const target = batches.find((b) => b.id.toString() === myBatchId.toString())!;
                setBatchId(target.id.toString());
                setAcademicYear(getBatchAcademicYear(target));
            } else {
                const first = batches[0];
                setBatchId(first.id.toString());
                setAcademicYear(getBatchAcademicYear(first));
            }
        }
    }, [batches, batchId, myBatchId]);

    const handleBatchChange = (newBatchId: string) => {
        setBatchId(newBatchId);
        const sel = batches.find((b) => b.id.toString() === newBatchId);
        if (sel) {
            setAcademicYear(getBatchAcademicYear(sel));
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim() || !batchId) return;
        setLoading(true);
        setMessage(null);

        try {
            await courseService.create({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                academicYear,
                semesterNumber,
                batchId: parseInt(batchId),
            });
            setMessage({ type: "success", text: `Successfully added course ${code.trim().toUpperCase()}!` });
            setCode("");
            setName("");
            if (onCourseCreated) onCourseCreated();
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to create course." });
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
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, fontFamily: font }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EFF6FF", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookPlus size={18} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                    Create Course Module
                </h3>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px 0" }}>
                Add a new academic module linked to a batch, academic year, and semester.
            </p>

            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                    <label style={labelStyle}>
                        Target Academic Batch {currentRole === "BATCH_LEADER" ? "(Your Batch)" : ""}
                    </label>
                    <select
                        value={batchId}
                        onChange={(e) => handleBatchChange(e.target.value)}
                        disabled={currentRole === "BATCH_LEADER"}
                        required
                        style={{
                            ...inputStyle,
                            cursor: currentRole === "BATCH_LEADER" ? "not-allowed" : "pointer",
                            background: currentRole === "BATCH_LEADER" ? "#F9FAFB" : "white",
                            color: currentRole === "BATCH_LEADER" ? "#4B5563" : "#0D1B2A",
                        }}
                    >
                        {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name} (Intake {b.intakeYear} · Year {getBatchAcademicYear(b)})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Course Code</label>
                        <input
                            type="text"
                            placeholder="e.g. IN1010"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Course Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Data Structures & Algorithms"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Academic Year</label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                            style={{ ...inputStyle, cursor: "pointer" }}
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
                            onChange={(e) => setSemesterNumber(parseInt(e.target.value))}
                            style={{ ...inputStyle, cursor: "pointer" }}
                        >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ padding: "10px 24px", alignSelf: "flex-start", fontSize: 13 }}
                >
                    {loading ? "Creating..." : "Create Course"}
                </button>
            </form>

            {message && (
                <div
                    style={{
                        marginTop: 18,
                        background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                        color: message.type === "success" ? "#065F46" : "#DC2626",
                        padding: "11px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {message.type === "success" && <CheckCircle2 size={16} color="#10B981" />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
