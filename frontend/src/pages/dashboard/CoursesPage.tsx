import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { type Course, type Resource } from "../../types";
import CourseCard from "../../components/CourseCard";
import KpiCard from "../../components/KpiCard";

function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [resourceCount, setResourceCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get<Course[]>("/courses"),
            api.get<Resource[]>("/resources"),
        ])
            .then(([coursesRes, resourcesRes]) => {
                setCourses(coursesRes.data);
                setResourceCount(resourcesRes.data.length);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 820 }}>
            <h1 style={{ fontSize: 30, marginBottom: 24 }}>Courses</h1>

            <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                <KpiCard label="Courses" value={courses.length} />
                <KpiCard label="Resources Shared" value={resourceCount} />
                <KpiCard label="Duplicates Blocked" value="—" />
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