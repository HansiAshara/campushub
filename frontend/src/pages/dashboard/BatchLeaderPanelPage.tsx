import { useState, useEffect, useCallback } from "react";
import { batchService } from "../../api/batchService";
import { courseService } from "../../api/courseService";
import { userService, type UserResponse } from "../../api/userService";
import { type Batch, type Course, type CourseModerator } from "../../types";
import {
    BookOpen,
    Shield,
    Users,
    PlusCircle,
} from "lucide-react";

// Modular Leader Components
import LeaderStatsHeader from "../../components/features/leader/common/LeaderStatsHeader";
import LeaderBatchInfoBanner from "../../components/features/leader/common/LeaderBatchInfoBanner";
import LeaderCourseTable from "../../components/features/leader/courses/LeaderCourseTable";
import LeaderAppointRepSection from "../../components/features/leader/leadership/LeaderAppointRepSection";
import LeaderActiveRepsList from "../../components/features/leader/leadership/LeaderActiveRepsList";
import LeaderBatchStudentsList from "../../components/features/leader/students/LeaderBatchStudentsList";
import LeaderAddCourseForm from "../../components/features/leader/forms/LeaderAddCourseForm";

const font = '"DM Sans", system-ui, sans-serif';

type LeaderTab = "courses" | "reps" | "students" | "create";

export default function BatchLeaderPanelPage() {
    const [activeTab, setActiveTab] = useState<LeaderTab>("courses");
    const [myBatch, setMyBatch] = useState<Batch | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [moderators, setModerators] = useState<CourseModerator[]>([]);
    const [students, setStudents] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseForRep, setSelectedCourseForRep] = useState<number | null>(null);

    const userName = localStorage.getItem("userName") || "Batch Leader";
    const userIndexNo = localStorage.getItem("indexNo") || "";
    const myBatchId = localStorage.getItem("batchId");
    const myBatchName = localStorage.getItem("batchName") || "";

    const refreshData = useCallback(async () => {
        try {
            const [batchListRes, modRes, userRes] = await Promise.allSettled([
                batchService.getAll(),
                courseService.getAllModerators(),
                userService.search(""), // Backend filters strictly to this batch for BATCH_LEADER
            ]);

            let activeBatch: Batch | null = null;

            if (batchListRes.status === "fulfilled") {
                const allBatches = batchListRes.value.data || [];
                if (myBatchId) {
                    activeBatch = allBatches.find((b) => b.id.toString() === myBatchId.toString()) || null;
                }
                if (!activeBatch && allBatches.length > 0) {
                    activeBatch = allBatches[0];
                }
                setMyBatch(activeBatch);
            }

            const targetBatchId = myBatchId || (activeBatch ? activeBatch.id : null);

            if (targetBatchId) {
                try {
                    const courseRes = await courseService.getByBatch(targetBatchId);
                    setCourses(courseRes.data || []);
                } catch (cErr) {
                    console.error("Failed to load batch courses:", cErr);
                }
            }

            if (modRes.status === "fulfilled") {
                const allMods = modRes.value.data || [];
                // Filter moderators for this batch only
                const batchMods = allMods.filter((m) =>
                    targetBatchId ? m.batchId.toString() === targetBatchId.toString() : true
                );
                setModerators(batchMods);
            }

            if (userRes.status === "fulfilled") {
                setStudents(userRes.value.data || []);
            }
        } catch (err) {
            console.error("Failed to load batch leader dashboard data:", err);
        } finally {
            setLoading(false);
        }
    }, [myBatchId]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleOpenAppointRepForCourse = (courseId?: number) => {
        if (courseId) {
            setSelectedCourseForRep(courseId);
        }
        setActiveTab("reps");
    };

    const effectiveBatchName = myBatch?.name || myBatchName || "Assigned Batch";
    const effectiveIntakeYear = myBatch?.intakeYear || "";
    const effectiveBatchId = myBatch?.id || myBatchId || "";

    return (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 32px 60px", fontFamily: font }}>
            {/* Top Batch Header Banner */}
            <LeaderBatchInfoBanner
                batchName={effectiveBatchName}
                intakeYear={effectiveIntakeYear}
                leaderName={userName}
                leaderIndexNo={userIndexNo}
                onOpenAddCourse={() => setActiveTab("create")}
            />

            {/* High-level Metric Cards */}
            <LeaderStatsHeader
                batchName={effectiveBatchName}
                intakeYear={effectiveIntakeYear}
                totalCourses={courses.length}
                totalReps={moderators.length}
                totalStudents={students.length}
            />

            <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
                {/* ── LEFT SIDEBAR NAVIGATION ── */}
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
                        <div
                            style={{
                                padding: "6px 8px 14px",
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#9CA3AF",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                borderBottom: "1px solid #F3F4F6",
                                marginBottom: 10,
                            }}
                        >
                            Leader Workspace
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <button
                                onClick={() => setActiveTab("courses")}
                                className={`filter-pill${activeTab === "courses" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <BookOpen size={15} style={{ marginRight: 8 }} />
                                Batch Modules
                            </button>

                            <button
                                onClick={() => setActiveTab("reps")}
                                className={`filter-pill${activeTab === "reps" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <Shield size={15} style={{ marginRight: 8 }} />
                                Module Coordinators
                            </button>

                            <button
                                onClick={() => setActiveTab("students")}
                                className={`filter-pill${activeTab === "students" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <Users size={15} style={{ marginRight: 8 }} />
                                Batch Students ({students.length})
                            </button>

                            <button
                                onClick={() => setActiveTab("create")}
                                className={`filter-pill${activeTab === "create" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "9px 12px", fontSize: 13, borderRadius: 8 }}
                            >
                                <PlusCircle size={15} style={{ marginRight: 8 }} />
                                Add New Module
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN WORKSPACE CONTENT ── */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    {loading ? (
                        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 48, textAlign: "center", color: "#9CA3AF" }}>
                            Loading batch leadership workspace...
                        </div>
                    ) : (
                        <>
                            {/* TAB 1: Courses Management */}
                            {activeTab === "courses" && (
                                <div className="fade-in">
                                    <div style={{ marginBottom: 18 }}>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            {effectiveBatchName} · Course Modules
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Create, edit, or delete academic course modules for your batch, and view appointed coordinators.
                                        </p>
                                    </div>

                                    <LeaderCourseTable
                                        courses={courses}
                                        moderators={moderators}
                                        batchId={effectiveBatchId}
                                        onRefresh={refreshData}
                                        onOpenAddCourse={() => setActiveTab("create")}
                                        onOpenAppointRep={handleOpenAppointRepForCourse}
                                    />
                                </div>
                            )}

                            {/* TAB 2: Module Coordinators */}
                            {activeTab === "reps" && (
                                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Module Coordinators & Reps
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Appoint student representatives to moderate and oversee course modules within your batch.
                                        </p>
                                    </div>

                                    {/* Appoint Coordinator Section */}
                                    <LeaderAppointRepSection
                                        courses={courses}
                                        batchName={effectiveBatchName}
                                        preSelectedCourseId={selectedCourseForRep}
                                        onRoleAssigned={refreshData}
                                    />

                                    {/* Active Coordinators List */}
                                    <LeaderActiveRepsList
                                        moderators={moderators}
                                        onRefresh={refreshData}
                                    />
                                </div>
                            )}

                            {/* TAB 3: Batch Students Directory */}
                            {activeTab === "students" && (
                                <div className="fade-in">
                                    <div style={{ marginBottom: 18 }}>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Enrolled Students Directory
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Browse and search all students enrolled in {effectiveBatchName}.
                                        </p>
                                    </div>

                                    <LeaderBatchStudentsList
                                        students={students}
                                        batchName={effectiveBatchName}
                                    />
                                </div>
                            )}

                            {/* TAB 4: Add New Course Module */}
                            {activeTab === "create" && (
                                <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", margin: "0 0 4px 0" }}>
                                            Add New Course Module
                                        </h2>
                                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                                            Quickly register a new academic course module for {effectiveBatchName}.
                                        </p>
                                    </div>

                                    <LeaderAddCourseForm
                                        batchId={effectiveBatchId}
                                        batchName={effectiveBatchName}
                                        onCourseCreated={refreshData}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
