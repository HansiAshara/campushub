import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useResourcesByCourse } from "../../hooks/useResources";
import ResourceItem from "../../components/features/resources/ResourceItem";
import { resourceService } from "../../api/resourceService";
import { CoordinatorOwnBanner, StudentCoordinatorInfo } from "../../components/features/courses/CoordinatorBanner";
import { CourseQueriesList } from "../../components/features/courses/CourseQueriesList";
import { Filter, Upload, ArrowLeft, FileText, Users, Clock, CheckSquare, Square, Trash2, ListChecks, Database, MessageSquare } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState<"RESOURCES" | "QUERIES">("RESOURCES");
    const { resources, loading, refetch } = useResourcesByCourse(courseId);

    const [course, setCourse] = useState<any>(null);

    useEffect(() => {
        if (courseId) {
            import("../../api/courseService").then(({ courseService }) => {
                courseService.getById(courseId).then(res => setCourse(res.data)).catch(console.error);
            });
        }
    }, [courseId]);

    const filtered = category === "ALL" ? resources : resources.filter((r) => r.resourceType === category);
    const contributors = new Set(resources.map((r) => r.uploadedByName)).size;
    const courseName = course?.name || resources[0]?.courseName || "Course";
    const role = localStorage.getItem("role") || "STUDENT";
    const userName = localStorage.getItem("userName") || "";
    const userIndexNo = localStorage.getItem("indexNo") || "";
    const isCoordinator = role === "MODULE_COORDINATOR" && course?.canManage;
    const canManageResources = course?.canManage || role === "BATCH_LEADER" || role === "ADMIN";

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(r => r.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} resource${selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.`)) return;

        setBulkDeleting(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => resourceService.remove(id)));
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            refetch();
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to delete some resources.");
        } finally {
            setBulkDeleting(false);
        }
    };

    const lastBatchId = localStorage.getItem("lastBatchId");
    const backLink = lastBatchId ? `/dashboard/batches/${lastBatchId}` : "/dashboard/batches";

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px" }}>

            {/* Breadcrumb */}
            <Link to={backLink} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", marginBottom: 28 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
                <ArrowLeft size={14} />
                Back to Courses
            </Link>

            {/* Coordinator banner — shown only to the coordinator of this specific course */}
            {isCoordinator && course && (
                <CoordinatorOwnBanner
                    courseCode={course.code}
                    courseName={course.name}
                    userName={userName}
                    userIndexNo={userIndexNo}
                />
            )}

            {/* Module coordinator info — shown to all non-coordinator users when a coordinator is assigned */}
            {!isCoordinator && course?.moderatorName && (
                <StudentCoordinatorInfo
                    moderatorName={course.moderatorName}
                    moderatorIndexNo={course.moderatorIndexNo}
                />
            )}

            {/* Tabs for Coordinators */}
            {isCoordinator && (
                <div style={{ display: "flex", gap: 32, marginBottom: 24, borderBottom: "1px solid #E5E7EB" }}>
                    <button
                        onClick={() => setActiveTab("RESOURCES")}
                        style={{
                            background: "none", border: "none", padding: "0 0 12px",
                            fontSize: 15, fontWeight: 700, cursor: "pointer",
                            color: activeTab === "RESOURCES" ? "#10B981" : "#6B7280",
                            borderBottom: activeTab === "RESOURCES" ? "2px solid #10B981" : "2px solid transparent",
                            display: "flex", alignItems: "center", gap: 8
                        }}
                    >
                        <Database size={16} />
                        Resources
                    </button>
                    <button
                        onClick={() => setActiveTab("QUERIES")}
                        style={{
                            background: "none", border: "none", padding: "0 0 12px",
                            fontSize: 15, fontWeight: 700, cursor: "pointer",
                            color: activeTab === "QUERIES" ? "#10B981" : "#6B7280",
                            borderBottom: activeTab === "QUERIES" ? "2px solid #10B981" : "2px solid transparent",
                            display: "flex", alignItems: "center", gap: 8
                        }}
                    >
                        <MessageSquare size={16} />
                        Student Queries
                    </button>
                </div>
            )}

            {activeTab === "QUERIES" ? (
                <CourseQueriesList courseId={Number(courseId)} />
            ) : (
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

                                {canManageResources && (
                                    <button
                                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: 6,
                                            padding: "8px 12px", fontSize: 13, fontWeight: 600, borderRadius: 8,
                                            border: "1px solid #E5E7EB", background: isSelectionMode ? "#F3F4F6" : "white",
                                            color: "#4B5563", cursor: "pointer"
                                        }}
                                    >
                                        <ListChecks size={14} />
                                        {isSelectionMode ? "Cancel Selection" : "Bulk Select"}
                                    </button>
                                )}
                                <Link to={`/dashboard/courses/${courseId}/upload`}>
                                    <button className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                                        <Upload size={14} />
                                        Upload
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {isSelectionMode && filtered.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <button
                                        onClick={toggleSelectAll}
                                        style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", color: "#1D4ED8", fontSize: 13, fontWeight: 600 }}
                                    >
                                        {selectedIds.size === filtered.length ? <CheckSquare size={16} /> : <Square size={16} />}
                                        Select All
                                    </button>
                                    <span style={{ fontSize: 13, color: "#1E40AF" }}>
                                        {selectedIds.size} selected
                                    </span>
                                </div>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={bulkDeleting}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 6, background: "#DC2626", color: "white",
                                            border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600,
                                            cursor: bulkDeleting ? "not-allowed" : "pointer", opacity: bulkDeleting ? 0.7 : 1
                                        }}
                                    >
                                        <Trash2 size={14} />
                                        {bulkDeleting ? "Deleting..." : "Delete Selected"}
                                    </button>
                                )}
                            </div>
                        )}

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
                                        <ResourceItem
                                            resource={r}
                                            onChanged={refetch}
                                            selectable={isSelectionMode}
                                            selected={selectedIds.has(r.id)}
                                            onToggleSelect={() => toggleSelect(r.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseDetailPage;