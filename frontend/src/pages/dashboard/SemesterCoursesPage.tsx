import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCoursesByBatch } from "../../hooks/useCourses";
import { type Course } from "../../types";
import { useNavigate } from "react-router-dom";
import { Filter, ChevronRight, BookOpen, ArrowLeft } from "lucide-react";

const YEARS = [1, 2, 3, 4];
const SEMS = [1, 2];

function SemesterCoursesPage() {
    const { batchId } = useParams();
    const [year, setYear] = useState(3);
    const [semester, setSemester] = useState(1);
    const { courses, loading } = useCoursesByBatch(batchId, year, semester);
    const navigate = useNavigate();

    const batchName = courses[0]?.batchName || "Batch";

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px" }}>

            {/* Breadcrumb */}
            <Link to="/dashboard/batches" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", marginBottom: 28, transition: "color 0.12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
                <ArrowLeft size={14} />
                Back to Batches
            </Link>

            <div style={{ display: "flex", gap: 32 }}>
                {/* ── LEFT FILTER PANEL ── */}
                <aside style={{ width: 220, flexShrink: 0 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "sticky", top: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <Filter size={15} color="#10B981" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Scope</span>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10 }}>
                                Year
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {YEARS.map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => setYear(y)}
                                        className={`filter-pill${y === year ? " active" : ""}`}
                                    >
                                        Year {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10 }}>
                                Semester
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {SEMS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSemester(s)}
                                        className={`filter-pill${s === semester ? " active" : ""}`}
                                    >
                                        Sem {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Role badge */}
                        <div style={{ marginTop: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#059669", textTransform: "uppercase", marginBottom: 4 }}>
                                Your Batch
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A" }}>{batchName}</div>
                            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Year {year} · Sem {semester}</div>
                        </div>
                    </div>
                </aside>

                {/* ── COURSE LIST ── */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div>
                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#0D1B2A" }}>
                                {batchName}
                            </h1>
                            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                                {loading ? "Loading..." : `${courses.length} course${courses.length !== 1 ? "s" : ""} · Year ${year}, Semester ${semester}`}
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
                            <p style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>No courses for Year {year} · Sem {semester} yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {courses.map((course: Course, i: number) => (
                                <button
                                    key={course.id}
                                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                    className="resource-card fade-in"
                                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", textAlign: "left", width: "100%", cursor: "pointer", border: "none", background: "white", animationDelay: `${i * 0.05}s` }}
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