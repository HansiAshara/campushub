import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { type Course, type Resource } from "../../types";
import CourseCard from "../../components/CourseCard";
import KpiCard from "../../components/KpiCard";
import WelcomeHeader from "../../components/WelcomeHeader";

function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [resourceCount, setResourceCount] = useState(0);
    const [topCategory, setTopCategory] = useState("—");
    const [latestUpload, setLatestUpload] = useState("—");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            api.get<Course[]>("/courses"),
            api.get<Resource[]>("/resources"),
        ])
            .then(([coursesRes, resourcesRes]) => {
                setCourses(coursesRes.data);
                setResourceCount(resourcesRes.data.length);

                if (resourcesRes.data.length > 0) {
                    const counts: Record<string, number> = {};
                    resourcesRes.data.forEach((r) => {
                        counts[r.resourceType] = (counts[r.resourceType] || 0) + 1;
                    });
                    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
                    setTopCategory(top.replace("_", " "));

                    const validDates = resourcesRes.data
                        .map((r) => new Date(r.createdAt).getTime())
                        .filter((t) => !isNaN(t));

                    if (validDates.length > 0) {
                        const latest = Math.max(...validDates);
                        setLatestUpload(
                            new Date(latest).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        );
                    }
                }
            })
            .catch(() => {
                setError("Failed to load courses. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>Loading dashboard...</p>;
    if (error) return <p style={{ color: "#EF4444", textAlign: "center", padding: "40px 0" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <WelcomeHeader />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
                <KpiCard label="Total Courses" value={courses.length} />
                <KpiCard label="Resources Shared" value={resourceCount} />
                <KpiCard label="Top Category" value={topCategory} />
                <KpiCard label="Latest Upload" value={latestUpload} />
            </div>

            {courses.length === 0 ? (
                <p style={{ color: "#64748B" }}>No courses have been added yet.</p>
            ) : (
                courses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
        </div>
    );
}

export default CoursesPage;