import { Users, Shield, BookOpen, Layers } from "lucide-react";

interface LeaderStatsHeaderProps {
    batchName: string;
    intakeYear: number | string;
    totalCourses: number;
    totalReps: number;
    totalStudents: number;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderStatsHeader({
    batchName,
    intakeYear,
    totalCourses,
    totalReps,
    totalStudents,
}: LeaderStatsHeaderProps) {
    const stats = [
        {
            label: "Batch Identity",
            value: batchName || "Your Batch",
            subtext: intakeYear ? `Intake Year ${intakeYear}` : "Assigned Batch",
            icon: Layers,
            color: "#10B981",
            bg: "#ECFDF5",
        },
        {
            label: "Batch Modules",
            value: totalCourses,
            subtext: "Configured Courses",
            icon: BookOpen,
            color: "#3B82F6",
            bg: "#EFF6FF",
        },
        {
            label: "Module Coordinators",
            value: totalReps,
            subtext: "Appointed Course Reps",
            icon: Shield,
            color: "#8B5CF6",
            bg: "#F5F3FF",
        },
        {
            label: "Enrolled Students",
            value: totalStudents,
            subtext: "Active in this Batch",
            icon: Users,
            color: "#F59E0B",
            bg: "#FFFBEB",
        },
    ];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 28,
                fontFamily: font,
            }}
        >
            {stats.map((s) => {
                const Icon = s.icon;
                return (
                    <div
                        key={s.label}
                        style={{
                            background: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: 14,
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                            transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: s.bg,
                                color: s.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={22} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#6B7280",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {s.label}
                            </div>
                            <div
                                style={{
                                    fontSize: typeof s.value === "number" ? 22 : 17,
                                    fontWeight: 800,
                                    color: "#0D1B2A",
                                    lineHeight: 1.2,
                                    marginTop: 2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {s.value}
                            </div>
                            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                                {s.subtext}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
