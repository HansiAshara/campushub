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

    const latestUpload = resources.length > 0
        ? new Date(
            Math.max(...resources.map((r) => new Date(r.createdAt).getTime()))
        ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "—";

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Link to="/dashboard/courses" style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>← Back to Courses</Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "16px 0 28px" }}>
                <div>
                    <span className="stamp" style={{ color: "#047857", backgroundColor: "#D1FAE5", border: "1px solid #A7F3D0" }}>{course?.code}</span>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginTop: 8 }}>{course?.name}</h1>
                    <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>{course?.semester}</p>
                </div>
                <Link to={`/dashboard/courses/${courseId}/upload`}>
                    <Button variant="chalk">+ Upload Resource</Button>
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                <KpiCard label="Resources" value={resources.length} />
                <KpiCard label="Contributors" value={contributors} />
                <KpiCard label="Latest Upload" value={latestUpload} />
            </div>

            {resources.length === 0 ? (
                <p style={{ color: "#64748B" }}>Nothing uploaded yet — be the first to share.</p>
            ) : (
                resources.map((r) => <ResourceItem key={r.id} resource={r} />)
            )}
        </div>
    );
}

export default CourseDetailPage;