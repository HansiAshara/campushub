import { ArrowLeft, Crown, BookOpen, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderBatchInfoBannerProps {
    batchName: string;
    intakeYear: number | string;
    leaderName: string;
    leaderIndexNo?: string;
    onOpenAddCourse: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

const permissions = [
    { icon: BookOpen, label: "Manage Modules" },
    { icon: UserPlus, label: "Appoint Coordinators" },
    { icon: Users, label: "Oversee Students" },
];

export default function LeaderBatchInfoBanner({
    batchName,
    intakeYear,
    leaderName,
    leaderIndexNo,
}: LeaderBatchInfoBannerProps) {
    return (
        <div style={{ marginBottom: 24, fontFamily: font }}>
            {/* Top Navigation & Status Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <Link
                    to="/dashboard/batches"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#6B7280",
                        textDecoration: "none",
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
                >
                    <ArrowLeft size={15} />
                    Back to All Batches
                </Link>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#F5F3FF",
                        border: "1px solid #DDD6FE",
                        padding: "5px 14px",
                        borderRadius: 20,
                        color: "#5B21B6",
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    <Crown size={14} color="#7C3AED" />
                    Batch Leader Workspace
                </div>
            </div>

            {/* Compact Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #064E3B 0%, #065F46 60%, #047857 100%)",
                    borderRadius: 16,
                    padding: "20px 28px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 18,
                    flexWrap: "wrap",
                    boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.25)",
                }}
            >
                {/* Left: Identity */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <span
                            style={{
                                background: "rgba(255,255,255,0.18)",
                                backdropFilter: "blur(4px)",
                                padding: "2px 10px",
                                borderRadius: 6,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.07em",
                                textTransform: "uppercase",
                            }}
                        >
                            Batch Leader Portal
                        </span>
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 3px 0", letterSpacing: "-0.02em" }}>
                        {batchName ? `${batchName} Management` : "Batch Leader Management"}
                    </h1>
                    <p style={{ fontSize: 12, color: "#A7F3D0", margin: 0, fontWeight: 500 }}>
                        {intakeYear && `Intake ${intakeYear} · `}Logged in as <strong style={{ color: "#D1FAE5" }}>{leaderName}{leaderIndexNo ? ` (${leaderIndexNo})` : ""}</strong>
                    </p>
                </div>

                {/* Right: Permission chips */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {permissions.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                background: "rgba(255,255,255,0.12)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: 20,
                                padding: "6px 14px",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "white",
                                backdropFilter: "blur(4px)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Icon size={13} style={{ flexShrink: 0 }} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
