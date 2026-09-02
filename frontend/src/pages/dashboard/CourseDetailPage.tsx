import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useResourcesByCourse } from "../../hooks/useResources";
import ResourceItem from "../../components/features/resources/ResourceItem";
import { Filter, Upload, ArrowLeft, FileText, Users, Clock, TrendingUp } from "lucide-react";
import { latestDate } from "../../utils/dateUtils";

const RESOURCE_TYPES = [
    { key: "ALL", label: "All" },
    { key: "KUPPI_NOTES", label: "Kuppi" },
    { key: "PAST_PAPER", label: "Past Paper" },
    { key: "TUTE", label: "Tute" },
    { key: "NOTES", label: "Notes" },
    { key: "SLIDES", label: "Slides" },
];

function CourseDetailPage() {
    const { courseId } = useParams();
    const [category, setCategory] = useState("ALL");
    const { resources, loading, refetch } = useResourcesByCourse(courseId);

    const filtered = category === "ALL" ? resources : resources.filter((r) => r.resourceType === category);
    const contributors = new Set(resources.map((r) => r.uploadedByName)).size;
    const courseName = resources[0]?.courseName || "Course";
    const role = localStorage.getItem("role") || "STUDENT";

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px" }}>

            {/* Breadcrumb */}
            <Link to="/dashboard/batches" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", marginBottom: 28 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
                <ArrowLeft size={14} />
                Back to Courses
            </Link>

            <div style={{ display: "flex", gap: 32 }}>
                {/* ── LEFT FILTER SIDEBAR ── */}
                <aside style={{ width: 220, flexShrink: 0 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "sticky", top: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <Filter size={15} color="#10B981" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Scope</span>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10 }}>
                                Resource Type
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {RESOURCE_TYPES.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setCategory(key)}
                                        className={`filter-pill${category === key ? " active" : ""}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
                            {[
                                { Icon: FileText, label: "Resources", value: resources.length },
                                { Icon: Users, label: "Contributors", value: contributors },
                                { Icon: Clock, label: "Latest", value: latestDate(resources) },
                            ].map(({ Icon, label, value }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Icon size={13} color="#10B981" />
                                    <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0D1B2A", marginLeft: "auto" }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Role badge */}
                        {(role === "BATCH_LEADER" || role === "MODULE_COORDINATOR") && (
                            <div style={{ marginTop: 16, background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#92400E", textTransform: "uppercase" }}>
                                    Your Role
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#78350F", marginTop: 2 }}>
                                    {role === "BATCH_LEADER" ? "Batch Leader" : "Module Coordinator"}
                                </div>
                                <div style={{ fontSize: 11, color: "#92400E", marginTop: 1 }}>
                                    {role === "BATCH_LEADER" ? "Batch curriculum & leadership enabled" : "Course moderator privileges"}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── RESOURCE LIST ── */}
                <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                        <div>
                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#0D1B2A", marginBottom: 4 }}>
                                {courseName}
                            </h1>
                            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                                {loading ? "Loading..." : `${filtered.length} resource${filtered.length !== 1 ? "s" : ""}`}
                                {category !== "ALL" && ` · ${RESOURCE_TYPES.find(t => t.key === category)?.label}`}
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF" }}>
                                <TrendingUp size={13} color="#10B981" />
                                Sorted by community score
                            </div>
                            <Link to={`/dashboard/courses/${courseId}/upload`}>
                                <button className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                                    <Upload size={14} />
                                    Upload
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Resources */}
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ height: 110, background: "white", border: "1px solid #E5E7EB", borderRadius: 12 }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 14, border: "1.5px dashed #E5E7EB" }}>
                            <FileText size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                            <p style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>Nothing here yet — be the first to share.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {filtered.map((r, i) => (
                                <div key={r.id} style={{ animationDelay: `${i * 0.04}s` }}>
                                    <ResourceItem resource={r} onChanged={refetch} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseDetailPage;