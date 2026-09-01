import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCoursesByBatch } from "../../hooks/useCourses";
import { batchService } from "../../api/batchService";
import { type Batch, type Course } from "../../types";
import { getBatchAcademicYear } from "../../utils/batchUtils";
import { Filter, ChevronRight, BookOpen, ArrowLeft, GraduationCap } from "lucide-react";

const SEMS = [1, 2];

function SemesterCoursesPage() {
    const { batchId } = useParams();
    const navigate = useNavigate();

    const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
    const [semester, setSemester] = useState(1);

    useEffect(() => {
        if (!batchId) return;
        batchService.getAll().then((res) => {
            const found = res.data?.find((b) => b.id.toString() === batchId.toString());
            if (found) {
                setCurrentBatch(found);
            }
        }).catch((err) => {
            console.error("Failed to load batch info:", err);
        });
    }, [batchId]);

    // Determine batch's academic year based on batch intake / name
    const batchYear = getBatchAcademicYear(currentBatch);
    const { courses, loading } = useCoursesByBatch(batchId, batchYear, semester);

    const batchName = currentBatch?.name || (courses[0]?.batchName || "Batch");
    const intakeYear = currentBatch?.intakeYear;

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px" }}>

            {/* Breadcrumb */}
            <Link
                to="/dashboard/batches"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#6B7280",
                    marginBottom: 28,
                    transition: "color 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
                <ArrowLeft size={14} />
                Back to Batches
            </Link>

            <div style={{ display: "flex", gap: 32 }}>
                {/* ── LEFT FILTER PANEL ── */}
                <aside style={{ width: 230, flexShrink: 0 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "sticky", top: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <Filter size={15} color="#10B981" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Scope Filter</span>
                        </div>

                        {/* Academic Year (Fixed to current batch) */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8 }}>
                                Academic Year
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#F0FDF4",
                                    border: "1.5px solid #A7F3D0",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <GraduationCap size={16} color="#059669" />
                                    <span style={{ fontSize: 14, fontWeight: 800, color: "#065F46" }}>
                                        Year {batchYear}
                                    </span>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#DCFCE7", padding: "2px 6px", borderRadius: 4 }}>
                                    Current
                                </span>
                            </div>
                        </div>

                        {/* Semester Toggle */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10 }}>
                                Select Semester
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {SEMS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSemester(s)}
                                        className={`filter-pill${s === semester ? " active" : ""}`}
                                        style={{
                                            padding: "10px 10px",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 13,
                                            borderRadius: 8,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Sem {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Scope Summary Badge */}
                        <div style={{ marginTop: 20, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>
                                Active Batch Scope
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0D1B2A" }}>
                                {batchName}
                            </div>
                            <div style={{ fontSize: 12, color: "#059669", marginTop: 2, fontWeight: 600 }}>
                                Year {batchYear} · Semester {semester}
                            </div>
                            {intakeYear && (
                                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                                    Intake {intakeYear}
                                </div>
                            )}
                        </div>

                        {/* Link to other batches if user wants other years */}
                        <div style={{ marginTop: 16, textAlign: "center" }}>
                            <Link
                                to="/dashboard/batches"
                                style={{
                                    fontSize: 12,
                                    color: "#059669",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                Browse other batches →
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* ── COURSE LIST ── */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                                    {batchName}
                                </h1>
                                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", background: "#ECFDF5", color: "#047857", borderRadius: 6, border: "1px solid #A7F3D0" }}>
                                    Year {batchYear}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                {loading
                                    ? "Loading courses..."
                                    : `${courses.length} course${courses.length !== 1 ? "s" : ""} · Year ${batchYear}, Semester ${semester}`}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ height: 80, background: "#F3F4F6", borderRadius: 12 }} />
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 14, border: "1.5px dashed #E5E7EB" }}>
                            <BookOpen size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                            <p style={{ fontSize: 15, color: "#374151", fontWeight: 600, marginBottom: 4 }}>
                                No courses found for Year {batchYear} · Semester {semester}
                            </p>
                            <p style={{ fontSize: 13, color: "#9CA3AF", maxWidth: 400, margin: "0 auto" }}>
                                Modules for this semester haven't been added yet. Module reps and administrators can add courses from the admin panel.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {courses.map((course: Course, i: number) => (
                                <button
                                    key={course.id}
                                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                    className="resource-card fade-in"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        padding: "18px 22px",
                                        textAlign: "left",
                                        width: "100%",
                                        cursor: "pointer",
                                        border: "none",
                                        background: "white",
                                        animationDelay: `${i * 0.05}s`,
                                    }}
                                >
                                    <span className="course-badge">{course.code}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 15, color: "#0D1B2A", marginBottom: 2 }}>{course.name}</div>
                                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>Year {course.academicYear} · Sem {course.semesterNumber}</div>
                                    </div>
                                    {course.canManage && (
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", background: "#FEF3C7", color: "#92400E", borderRadius: 4, border: "1px solid #FDE68A", letterSpacing: "0.04em" }}>
                                            REP
                                        </span>
                                    )}
                                    <ChevronRight size={16} color="#D1D5DB" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SemesterCoursesPage;