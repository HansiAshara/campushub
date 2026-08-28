import { Link } from "react-router-dom";
import { type Course } from "../../../types";
import Badge from "../../ui/Badge";

function CourseCard({ course }: { course: Course }) {
    return (
        <Link to={`/dashboard/courses/${course.id}`} className="hover-lift"
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", marginBottom: 10, backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: 12 }}>
            <span className="stamp">{course.code}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{course.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Year {course.academicYear} · Sem {course.semesterNumber}</div>
            </div>
            {course.canManage && <Badge tone="accent">REP</Badge>}
            <span style={{ color: "var(--color-text-muted)" }}>→</span>
        </Link>
    );
}

export default CourseCard;