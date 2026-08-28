import { useState, useEffect } from "react";
import { courseService } from "../../../api/courseService";
import { type Batch } from "../../../types";

interface AddCourseTabProps {
    batches: Batch[];
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AddCourseTab({ batches }: AddCourseTabProps) {
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [courseYear, setCourseYear] = useState(1);
    const [courseSem, setCourseSem] = useState(1);
    const [courseBatchId, setCourseBatchId] = useState("");
    const [courseLoading, setCourseLoading] = useState(false);
    const [courseMessage, setCourseMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (batches.length > 0) {
            setCourseBatchId(batches[0].id.toString());
        }
    }, [batches]);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseCode.trim() || !courseName.trim() || !courseBatchId) return;
        setCourseLoading(true);
        setCourseMessage(null);
        try {
            await courseService.create({
                code: courseCode,
                name: courseName,
                academicYear: courseYear,
                semesterNumber: courseSem,
                batchId: parseInt(courseBatchId),
            });
            setCourseMessage({ type: "success", text: `Successfully created course: ${courseCode} - ${courseName}` });
            setCourseCode("");
            setCourseName("");
        } catch (err: any) {
            setCourseMessage({ type: "error", text: err.response?.data?.message || "Failed to create course." });
        } finally {
            setCourseLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB",
        borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A",
        outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        background: "white",
    };

    const selectStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB",
        borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A",
        outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        background: "white", cursor: "pointer"
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontFamily: font, fontSize: 11, fontWeight: 700,
        color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7,
    };

    return (
        <div className="fade-in" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28, fontFamily: font }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>Create New Course Module</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                Add a specific module code and title scoped to an intake, year and semester.
            </p>

            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Course Code</label>
                        <input
                            type="text"
                            placeholder="e.g. IT3200"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Course Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Database Systems"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Academic Year</label>
                        <select
                            value={courseYear}
                            onChange={(e) => setCourseYear(parseInt(e.target.value))}
                            style={selectStyle}
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
                            value={courseSem}
                            onChange={(e) => setCourseSem(parseInt(e.target.value))}
                            style={selectStyle}
                        >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Scoped to Batch</label>
                    <select
                        value={courseBatchId}
                        onChange={(e) => setCourseBatchId(e.target.value)}
                        style={selectStyle}
                    >
                        {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name} (Intake {b.intakeYear})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn-primary" disabled={courseLoading} style={{ padding: "12px 28px", alignSelf: "flex-start" }}>
                    {courseLoading ? "Creating..." : "Create Course"}
                </button>
            </form>

            {courseMessage && (
                <div style={{
                    marginTop: 20,
                    background: courseMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                    border: `1px solid ${courseMessage.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                    color: courseMessage.type === "success" ? "#065F46" : "#991B1B",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                }}>
                    {courseMessage.text}
                </div>
            )}
        </div>
    );
}
