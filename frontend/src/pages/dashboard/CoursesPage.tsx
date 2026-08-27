import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { type Course, type Resource } from "../../types";
import CourseCard from "../../components/CourseCard";
import KpiCard from "../../components/KpiCard";

function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [resourceCount, setResourceCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [latestUpload, setLatestUpload] = useState("—");

    useEffect(() => {
        Promise.all([
            api.get<Course[]>("/courses"),
            api.get<Resource[]>("/resources"),
        ])
            .then(([coursesRes, resourcesRes]) => {
                setCourses(coursesRes.data);
                setResourceCount(resourcesRes.data.length);
                const latestUpload = resourcesRes.data.length > 0
                    ? new Date(
                        Math.max(...resourcesRes.data.map((r) => new Date(r.createdAt).getTime()))
                    ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "—";
                setLatestUpload(latestUpload);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Top Bar / Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>
                        Good morning 👋
                    </h1>
                    <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                        August 2026 — Here's your academic overview
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 14px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 20,
                            fontSize: 13,
                            color: "#64748B",
                            boxShadow: "var(--shadow-sm)",
                        }}
                    >
                        <span>📅</span>
                        <span>Thu, 27 August 2026</span>
                    </div>

                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: "#10B981",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                        }}
                    >
                        HA
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 36 }}>
                <KpiCard label="Total Courses" value={courses.length} />
                <KpiCard label="Resources Shared" value={resourceCount} />
                <KpiCard label="Top Category" value="Kuppi Notes" />
                <KpiCard label="Latest Upload" value={latestUpload} />
            </div>

            {courses.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)" }}>No courses have been added yet.</p>
            ) : (
                courses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
        </div>
    );
}

export default CoursesPage;