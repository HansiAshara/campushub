import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useResourcesByCourse } from "../../hooks/useResources";
import ResourceItem from "../../components/features/resources/ResourceItem";
import KpiCard from "../../components/common/KpiCard";
import CategoryTabs from "../../components/common/CategoryTabs";
import Button from "../../components/ui/Button";
import { latestDate } from "../../utils/dateUtils";

function CourseDetailPage() {
    const { courseId } = useParams();
    const [category, setCategory] = useState("ALL");
    const { resources, loading, refetch } = useResourcesByCourse(courseId);

    if (loading) return <p>Loading...</p>;

    const filtered = category === "ALL" ? resources : resources.filter((r) => r.resourceType === category);
    const contributors = new Set(resources.map((r) => r.uploadedByName)).size;

    return (
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <Link to="/dashboard/batches" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Back</Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "10px 0 24px" }}>
                <div>
                    <span className="stamp">{resources[0]?.courseName || "Course"}</span>
                    <h1 style={{ fontSize: 26, marginTop: 8 }}>{resources[0]?.courseName}</h1>
                </div>
                <Link to={`/dashboard/courses/${courseId}/upload`}>
                    <Button variant="accent">+ Upload Resource</Button>
                </Link>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <KpiCard label="Resources" value={resources.length} />
                <KpiCard label="Contributors" value={contributors} />
                <KpiCard label="Latest Upload" value={latestDate(resources)} />
            </div>

            <CategoryTabs active={category} onChange={setCategory} />

            {filtered.length === 0 ? <p style={{ color: "var(--color-text-muted)" }}>Nothing here yet — be the first to share.</p> : filtered.map((r) => <ResourceItem key={r.id} resource={r} onChanged={refetch} />)}
        </div>
    );
}

export default CourseDetailPage;