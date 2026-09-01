import { Users, Shield, BookOpen, Layers } from "lucide-react";

interface AdminStatsHeaderProps {
    totalBatches: number;
    totalLeaders: number;
    totalCourses: number;
    totalReps: number;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AdminStatsHeader({
    totalBatches,
    totalLeaders,
    totalCourses,
    totalReps,
}: AdminStatsHeaderProps) {
    const stats = [
        { label: "Total Batches", value: totalBatches, icon: Layers, color: "#10B981", bg: "#ECFDF5" },
        { label: "Active Leaders", value: totalLeaders, icon: Shield, color: "#8B5CF6", bg: "#F5F3FF" },
        { label: "Module Coordinators", value: totalReps, icon: Users, color: "#F59E0B", bg: "#FFFBEB" },
        { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "#3B82F6", bg: "#EFF6FF" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28, fontFamily: font }}>
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
                        <div>
                            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: "#0D1B2A", lineHeight: 1.15, marginTop: 2 }}>
                                {s.value}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
