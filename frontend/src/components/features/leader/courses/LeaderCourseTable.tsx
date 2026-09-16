import { useState } from "react";
import { type Course, type CourseModerator } from "../../../../types";
import { courseService } from "../../../../api/courseService";
import LeaderEditCourseModal from "./LeaderEditCourseModal";
import ConfirmDeleteDialog from "../../admin/common/ConfirmDeleteDialog";
import { Search, Plus, Edit2, Trash2, Shield, UserPlus } from "lucide-react";

interface LeaderCourseTableProps {
    courses: Course[];
    moderators: CourseModerator[];
    batchId: number | string;
    onRefresh: () => void;
    onOpenAddCourse: () => void;
    onOpenAppointRep: (courseId?: number) => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderCourseTable({
    courses,
    moderators,
    batchId,
    onRefresh,
    onOpenAddCourse,
    onOpenAppointRep,
}: LeaderCourseTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
    const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>("ALL");

    // Modal states
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleDeleteCourse = async () => {
        if (!deletingCourse) return;
        setDeleteLoading(true);
        try {
            await courseService.delete(deletingCourse.id);
            setMessage({ type: "success", text: "Course module deleted successfully!" });
            setDeletingCourse(null);
            onRefresh();
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to delete course module." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredCourses = courses.filter((c) => {
        const matchesQuery =
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesYear =
            selectedYearFilter === "ALL" || c.academicYear.toString() === selectedYearFilter;

        const matchesSemester =
            selectedSemesterFilter === "ALL" || c.semesterNumber.toString() === selectedSemesterFilter;

        return matchesQuery && matchesYear && matchesSemester;
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
                    <div style={{ position: "relative", minWidth: 220, flex: 1, maxWidth: 320 }}>
                        <input
                            type="text"
                            placeholder="Search by code or title..."
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
                                boxSizing: "border-box",
                            }}
                        />
                        <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: 11, top: 11 }} />
                    </div>

                    {/* Academic Year Filter */}
                    <select
                        value={selectedYearFilter}
                        onChange={(e) => setSelectedYearFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="ALL">All Academic Years</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                    </select>

                    {/* Semester Filter */}
                    <select
                        value={selectedSemesterFilter}
                        onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="ALL">All Semesters</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                    </select>
                </div>

                <button
                    onClick={onOpenAddCourse}
                    className="btn-primary"
                    style={{
                        padding: "8px 18px",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <Plus size={15} />
                    New Course Module
                </button>
            </div>

            {/* Notification Message */}
            {message && (
                <div
                    style={{
                        marginBottom: 20,
                        background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                        color: message.type === "success" ? "#065F46" : "#991B1B",
                        padding: "12px 16px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    {message.text}
                </div>
            )}

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
                {filteredCourses.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center", color: "#6B7280" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px 0", color: "#374151" }}>
                            No course modules found
                        </p>
                        <p style={{ fontSize: 13, margin: "0 0 16px 0" }}>
                            {courses.length === 0
                                ? "No courses have been created for your batch yet."
                                : "No courses match the current filter criteria."}
                        </p>
                        <button
                            onClick={onOpenAddCourse}
                            className="btn-primary"
                            style={{ padding: "8px 18px", fontSize: 13 }}
                        >
                            <Plus size={14} style={{ marginRight: 6 }} />
                            Create First Module
                        </button>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Module Code
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Module Title
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Academic Level
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Module Coordinator
                                </th>
                                <th style={{ padding: "12px 18px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", textAlign: "right" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((c) => {
                                const courseMods = moderators.filter((m) => m.courseId === c.id);

                                return (
                                    <tr
                                        key={c.id}
                                        style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0D1B2A" }}>
                                            <span style={{ padding: "4px 8px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                                                {c.code}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 18px", fontWeight: 600, color: "#1F2937" }}>
                                            {c.name}
                                        </td>
                                        <td style={{ padding: "14px 18px", color: "#6B7280" }}>
                                            <span style={{ padding: "2px 8px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#374151" }}>
                                                Year {c.academicYear} · Sem {c.semesterNumber}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            {courseMods.length > 0 ? (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                    {courseMods.map((m) => (
                                                        <span
                                                            key={m.userId}
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                padding: "3px 8px",
                                                                background: "#FEF3C7",
                                                                color: "#92400E",
                                                                borderRadius: 6,
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                            }}
                                                            title={`${m.userEmail} ${m.userIndexNo ? `(${m.userIndexNo})` : ""}`}
                                                        >
                                                            <Shield size={11} color="#D97706" />
                                                            {m.userName} {m.userIndexNo && `(${m.userIndexNo})`}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => onOpenAppointRep(c.id)}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        padding: "3px 8px",
                                                        background: "#F3F4F6",
                                                        border: "1px dashed #D1D5DB",
                                                        color: "#6B7280",
                                                        borderRadius: 6,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        transition: "all 0.15s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = "#10B981";
                                                        e.currentTarget.style.color = "#059669";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = "#D1D5DB";
                                                        e.currentTarget.style.color = "#6B7280";
                                                    }}
                                                    title="Appoint a student as module coordinator"
                                                >
                                                    <UserPlus size={11} />
                                                    Assign Rep
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                <button
                                                    onClick={() => setEditingCourse(c)}
                                                    style={{
                                                        border: "1px solid #E5E7EB",
                                                        background: "white",
                                                        borderRadius: 6,
                                                        padding: "5px 9px",
                                                        cursor: "pointer",
                                                        color: "#4B5563",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                    }}
                                                    title="Edit course details"
                                                >
                                                    <Edit2 size={12} color="#6B7280" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeletingCourse(c)}
                                                    style={{
                                                        border: "1px solid #FECACA",
                                                        background: "#FEF2F2",
                                                        borderRadius: 6,
                                                        padding: "5px 9px",
                                                        cursor: "pointer",
                                                        color: "#DC2626",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                    }}
                                                    title="Delete course module"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Course Modal */}
            <LeaderEditCourseModal
                course={editingCourse}
                batchId={batchId}
                isOpen={!!editingCourse}
                onClose={() => setEditingCourse(null)}
                onUpdated={onRefresh}
            />

            {/* Confirm Delete Course Dialog */}
            <ConfirmDeleteDialog
                isOpen={!!deletingCourse}
                title="Delete Course Module?"
                description={`Are you sure you want to delete ${deletingCourse?.code} (${deletingCourse?.name})? All assigned module coordinators for this course will be unlinked.`}
                confirmText="Yes, Delete Course"
                loading={deleteLoading}
                onConfirm={handleDeleteCourse}
                onCancel={() => setDeletingCourse(null)}
            />
        </div>
    );
}
