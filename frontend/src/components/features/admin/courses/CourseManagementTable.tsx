import { useState, useEffect } from "react";
import { type Course, type Batch } from "../../../../types";
import { courseService } from "../../../../api/courseService";
import EditCourseModal from "./EditCourseModal";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

interface CourseManagementTableProps {
    batches: Batch[];
    onOpenAddCourse: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function CourseManagementTable({
    batches,
    onOpenAddCourse,
}: CourseManagementTableProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("ALL");
    const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");

    const currentRole = localStorage.getItem("role") || "STUDENT";
    const myBatchId = localStorage.getItem("batchId");
    const canCreateCourse = currentRole === "BATCH_LEADER" || (currentRole === "ADMIN" && !!myBatchId);

    // Modal states
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const res = await courseService.getAll();
            setCourses(res.data);
        } catch (err) {
            console.error("Failed to load courses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleDeleteCourse = async () => {
        if (!deletingCourse) return;
        setDeleteLoading(true);
        try {
            await courseService.delete(deletingCourse.id);
            setDeletingCourse(null);
            loadCourses();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete course.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredCourses = courses.filter((c) => {
        const matchesQuery =
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.batchName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBatch =
            selectedBatchFilter === "ALL" || c.batchName === selectedBatchFilter;

        const matchesYear =
            selectedYearFilter === "ALL" || c.academicYear.toString() === selectedYearFilter;

        return matchesQuery && matchesBatch && matchesYear;
    });

    const selectStyle: React.CSSProperties = {
        padding: "8px 12px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 13,
        fontFamily: font,
        color: "#374151",
        background: "white",
        outline: "none",
        cursor: "pointer",
    };

    return (
        <div style={{ fontFamily: font }}>
            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, flex: 1 }}>
                    {/* Search */}
                    <div style={{ position: "relative", minWidth: 240, flex: 1, maxWidth: 320 }}>
                        <input
                            type="text"
                            placeholder="Search by code, title, or batch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px 8px 34px",
                                border: "1px solid #E5E7EB",
                                borderRadius: 8,
                                fontSize: 13,
                                fontFamily: font,
                                outline: "none",
                                background: "white",
                            }}
                        />
                        <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: 11, top: 11 }} />
                    </div>

                    {/* Batch Filter */}
                    <select
                        value={selectedBatchFilter}
                        onChange={(e) => setSelectedBatchFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="ALL">All Batches</option>
                        {batches.map((b) => (
                            <option key={b.id} value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                    {/* Academic Year Filter */}
                    <select
                        value={selectedYearFilter}
                        onChange={(e) => setSelectedYearFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="ALL">All Years</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                    </select>
                </div>

                <button
                    onClick={() => {
                        if (canCreateCourse) {
                            onOpenAddCourse();
                        } else {
                            alert("To create courses for your batch, please set your enrolled student batch in the 'My Student Profile' tab.");
                        }
                    }}
                    className="btn-primary"
                    style={{
                        padding: "8px 18px",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: canCreateCourse ? 1 : 0.85,
                    }}
                    title={canCreateCourse ? "Add a new course" : "Set your student batch in My Student Profile to add courses"}
                >
                    <Plus size={15} />
                    New Course
                </button>
            </div>

            {/* Table Container */}
            <div
                style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
            >
                {loading ? (
                    <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
                        Loading courses...
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center", color: "#6B7280" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px 0", color: "#374151" }}>
                            No courses match your filter
                        </p>
                        <p style={{ fontSize: 13, margin: 0 }}>
                            Try adjusting your filters or click 'New Course' to add one.
                        </p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Code
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Course Title
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Batch
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Year & Semester
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", textAlign: "right" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((c) => (
                                <tr
                                    key={c.id}
                                    style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0D1B2A" }}>
                                        <span style={{ padding: "3px 8px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 6, fontSize: 12 }}>
                                            {c.code}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#1F2937" }}>
                                        {c.name}
                                    </td>
                                    <td style={{ padding: "14px 18px", color: "#4B5563" }}>
                                        <span style={{ padding: "2px 8px", background: "#ECFDF5", color: "#065F46", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                            {c.batchName}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>
                                        Year {c.academicYear} · Sem {c.semesterNumber}
                                    </td>
                                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                        {(() => {
                                            const isBatchManager = Boolean(
                                                c.canManage ||
                                                (myBatchId && batches.find((b) => b.id.toString() === myBatchId.toString())?.name === c.batchName)
                                            );
                                            return isBatchManager ? (
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                    <button
                                                        onClick={() => setEditingCourse(c)}
                                                        style={{
                                                            border: "1px solid #E5E7EB",
                                                            background: "white",
                                                            borderRadius: 6,
                                                            padding: "5px 8px",
                                                            cursor: "pointer",
                                                            color: "#4B5563",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 4,
                                                            fontSize: 12,
                                                        }}
                                                        title="Edit course"
                                                    >
                                                        <Edit2 size={13} color="#6B7280" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingCourse(c)}
                                                        style={{
                                                            border: "1px solid #FECACA",
                                                            background: "#FEF2F2",
                                                            borderRadius: 6,
                                                            padding: "5px 8px",
                                                            cursor: "pointer",
                                                            color: "#DC2626",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 4,
                                                            fontSize: 12,
                                                        }}
                                                        title="Delete course"
                                                    >
                                                        <Trash2 size={13} />
                                                        Delete
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        padding: "3px 8px",
                                                        background: "#F9FAFB",
                                                        border: "1px solid #E5E7EB",
                                                        color: "#6B7280",
                                                        borderRadius: 6,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                    }}
                                                    title="Global university directory view"
                                                >
                                                    Directory View
                                                </span>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Course Modal */}
            <EditCourseModal
                course={editingCourse}
                batches={batches}
                isOpen={!!editingCourse}
                onClose={() => setEditingCourse(null)}
                onUpdated={loadCourses}
            />

            {/* Confirm Delete Course Dialog */}
            <ConfirmDeleteDialog
                isOpen={!!deletingCourse}
                title="Delete Academic Course?"
                description={`Are you sure you want to delete ${deletingCourse?.code} (${deletingCourse?.name})? All assigned moderators will also be unlinked.`}
                confirmText="Yes, Delete Course"
                loading={deleteLoading}
                onConfirm={handleDeleteCourse}
                onCancel={() => setDeletingCourse(null)}
            />
        </div>
    );
}
