import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios";
import { type Course, type Resource } from "../../types";
import ResourceItem from "../../components/ResourceItem";
import KpiCard from "../../components/KpiCard";
import Button from "../../components/ui/Button";

function CourseDetailPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get<Course>(`/courses/${courseId}`),
            api.get<Resource[]>(`/resources/course/${courseId}`),
        ])
            .then(([courseRes, resourcesRes]) => {
                setCourse(courseRes.data);
                setResources(resourcesRes.data);
            })
            .finally(() => setLoading(false));
    }, [courseId]);

    if (loading) return <p>Loading...</p>;

    const contributors = new Set(resources.map((r) => r.uploadedByName)).size;

    return (
        <div style={{ maxWidth: 820 }}>
            <Link to="/dashboard/courses" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Back to Courses</Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "10px 0 24px" }}>
                <div>
                    <span className="stamp" style={{ color: "var(--color-ink)" }}>{course?.code}</span>
                    <h1 style={{ fontSize: 28, marginTop: 8 }}>{course?.name}</h1>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>{course?.semester}</p>
                </div>
                <Link to={`/dashboard/courses/${courseId}/upload`}>
                    <Button variant="chalk">+ Upload Resource</Button>
                </Link>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                <KpiCard label="Resources" value={resources.length} />
                <KpiCard label="Contributors" value={contributors} />
            </div>

            {resources.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)" }}>Nothing uploaded yet — be the first to share.</p>
            ) : (
                resources.map((r) => <ResourceItem key={r.id} resource={r} />)
            )}
        </div>
    );
}

export default CourseDetailPage;