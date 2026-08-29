import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { batchService } from "../../api/batchService";
import { courseService } from "../../api/courseService";
import { type Batch, type Course, type CourseModerator } from "../../types";
import {
    ArrowLeft,
    Layers,
    BookOpen,
    Shield,
    PlusCircle,
    ShieldAlert,
} from "lucide-react";

// Modular Admin Components
import AdminStatsHeader from "../../components/features/admin/common/AdminStatsHeader";
import BatchManagementGrid from "../../components/features/admin/batches/BatchManagementGrid";
import CourseManagementTable from "../../components/features/admin/courses/CourseManagementTable";
import AppointRoleSection from "../../components/features/admin/leadership/AppointRoleSection";
import ActiveLeadersList from "../../components/features/admin/leadership/ActiveLeadersList";
import ActiveRepsList from "../../components/features/admin/leadership/ActiveRepsList";
import AddBatchForm from "../../components/features/admin/forms/AddBatchForm";
import AddCourseForm from "../../components/features/admin/forms/AddCourseForm";

const font = '"DM Sans", system-ui, sans-serif';

type AdminTab = "batches" | "courses" | "leadership" | "create";

export default function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>("batches");
    const [batches, setBatches] = useState<Batch[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [moderators, setModerators] = useState<CourseModerator[]>([]);
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem("role") || "STUDENT";

    const refreshData = useCallback(async () => {
        try {
            const [batchRes, courseRes, modRes] = await Promise.allSettled([
                batchService.getAll(),
                courseService.getAll(),
                courseService.getAllModerators(),
            ]);

            if (batchRes.status === "fulfilled") setBatches(batchRes.value.data || []);
            if (courseRes.status === "fulfilled") setCourses(courseRes.value.data || []);
            if (modRes.status === "fulfilled") setModerators(modRes.value.data || []);
        } catch (err) {
            console.error("Failed to load admin dashboard data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const activeLeadersCount = batches.filter((b) => !!b.leaderName).length;

    return (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 32px 60px", fontFamily: font }}>
            {/* Top Navigation & Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <Link
                    to="/dashboard/batches"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#6B7280",
                        textDecoration: "none",
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
                >
                    <ArrowLeft size={15} />
                    Back to Batches
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ECFDF5", padding: "4px 12px", borderRadius: 8, color: "#065F46", fontSize: 12, fontWeight: 700 }}>
                    <ShieldAlert size={14} color="#10B981" />
                    {role === "ADMIN" ? "System Administrator" : "Batch Leadership"}
                </div>
            </div>

            {/* Top High-level Metric Cards */}
            <AdminStatsHeader
                totalBatches={batches.length}
                totalLeaders={activeLeadersCount}
                totalCourses={courses.length}
                totalReps={moderators.length}
            />

            <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
                {/* ── LEFT CATEGORY SIDEBAR ── */}
                <aside style={{ width: 230, flexShrink: 0 }}>
                    <div
                        style={{
                            background: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: 16,
                            padding: 16,
                            position: "sticky",
                            top: 80,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                        }}
                    >
                        <div style={{ padding: "6px 8px 14px", fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #F3F4F6", marginBottom: 10 }}>
                            Admin Navigation
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <button
                                onClick={() => setActiveTab("batches")}
                                className={`filter-pill${activeTab === "batches" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <Layers size={15} style={{ marginRight: 8 }} />
                                Batches & Leaders
                            </button>

                            <button
                                onClick={() => setActiveTab("courses")}
                                className={`filter-pill${activeTab === "courses" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <BookOpen size={15} style={{ marginRight: 8 }} />
                                Academic Courses
                            </button>

                            <button
                                onClick={() => setActiveTab("leadership")}
                                className={`filter-pill${activeTab === "leadership" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <Shield size={15} style={{ marginRight: 8 }} />
                                Role Management
                            </button>

                            {role === "ADMIN" && (
                                <button
                                    onClick={() => setActiveTab("create")}
                                    className={`filter-pill${activeTab === "create" ? " active" : ""}`}
                                    style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                                >
                                    <PlusCircle size={15} style={{ marginRight: 8 }} />
                                    Creation Hub
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ── MAIN WORKSPACE CONTENT ── */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    {loading ? (
                        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 48, textAlign: "center", color: "#9CA3AF" }}>
                            Loading admin dashboard...
                        </div>
                    ) : (
                        <>
                            {/* TAB 1: Batches Overview & Leader Assignment */}
                            {activeTab === "batches" && (
                                <div className="fade-in">
                                    <div style={{ marginBottom: 18 }}>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Academic Batches & Leaders
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            View all currently configured intake batches, assign or replace batch leaders, and manage batch settings.
                                        </p>
                                    </div>

                                    <BatchManagementGrid
                                        batches={batches}
                                        onRefresh={refreshData}
                                        onOpenAddBatch={() => setActiveTab("create")}
                                    />
                                </div>
                            )}

                            {/* TAB 2: Academic Courses Directory & Management */}
                            {activeTab === "courses" && (
                                <div className="fade-in">
                                    <div style={{ marginBottom: 18 }}>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Academic Courses & Modules
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Browse, filter, edit, or remove courses linked to each batch, academic year, and semester.
                                        </p>
                                    </div>

                                    <CourseManagementTable
                                        batches={batches}
                                        onOpenAddCourse={() => setActiveTab("create")}
                                    />
                                </div>
                            )}

                            {/* TAB 3: Leadership & Representative Assignment */}
                            {activeTab === "leadership" && (
                                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Leadership & Representatives
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Search students to promote them to Batch Leaders or Course Module Representatives, or revoke active privileges.
                                        </p>
                                    </div>

                                    {/* Appoint Section */}
                                    <AppointRoleSection
                                        batches={batches}
                                        onRoleAssigned={refreshData}
                                    />

                                    {/* Active Batch Leaders List */}
                                    <ActiveLeadersList
                                        batches={batches}
                                        onRefresh={refreshData}
                                    />

                                    {/* Active Course Reps List */}
                                    <ActiveRepsList
                                        onRefresh={refreshData}
                                    />
                                </div>
                            )}

                            {/* TAB 4: Quick Creation Hub */}
                            {role === "ADMIN" && activeTab === "create" && (
                                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Creation Hub
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Quickly register new academic batches and course modules.
                                        </p>
                                    </div>

                                    <AddBatchForm onBatchCreated={refreshData} />
                                    <AddCourseForm batches={batches} onCourseCreated={refreshData} />
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
