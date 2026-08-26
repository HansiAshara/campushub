import { Link } from "react-router-dom";
import { type Course } from "../types";

function CourseCard({ course }: { course: Course }) {
    return (
        <Link
            to={`/dashboard/courses/${course.id}`}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "18px 22px",
                marginBottom: 14,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#CBD5E1";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
        >
            <span
                className="stamp"
                style={{
                    backgroundColor: "#D1FAE5",
                    color: "#047857",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid #A7F3D0",
                    flexShrink: 0,
                }}
            >
                {course.code}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: "#0F172A", letterSpacing: "-0.01em" }}>
                    {course.name}
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    {course.semester}
                </div>
            </div>
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748B",
                    fontWeight: 700,
                    fontSize: 14,
                }}
            >
                →
            </div>
        </Link>
    );
}

export default CourseCard;