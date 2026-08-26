import { Link } from "react-router-dom";
import { type Course } from "../types";

function CourseCard({ course }: { course: Course }) {
    return (
        <Link
            to={`/dashboard/courses/${course.id}`}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                marginBottom: 10,
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-chalk)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
        >
            <span className="stamp" style={{ color: "var(--color-ink)", flexShrink: 0 }}>{course.code}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{course.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{course.semester}</div>
            </div>
            <span style={{ color: "var(--color-text-muted)" }}>→</span>
        </Link>
    );
}

export default CourseCard;