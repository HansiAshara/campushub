import { ArrowLeft, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderBatchInfoBannerProps {
    batchName: string;
    intakeYear: number | string;
    leaderName: string;
    onOpenAddCourse: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderBatchInfoBanner({
    batchName,
    intakeYear,
    leaderName,
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

            {/* Banner Header Card */}
            <div
                style={{
                    background: "linear-gradient(135deg, #064E3B 0%, #065F46 60%, #047857 100%)",
                    borderRadius: 16,
                    padding: "24px 28px",
                    color: "white",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 18,
                    boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.25)",
                }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span
                            style={{
                                background: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(4px)",
                                padding: "3px 10px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                            }}
                        >
                            Batch Leader Portal
                        </span>
                        {intakeYear && (
                            <span style={{ fontSize: 13, color: "#A7F3D0", fontWeight: 600 }}>
                                Intake {intakeYear}
                            </span>
                        )}
                    </div>

                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                        {batchName ? `${batchName} Management` : "Batch Leader Management"}
                    </h1>
                    <p style={{ fontSize: 13, color: "#D1FAE5", margin: 0, maxWidth: 540, lineHeight: 1.4 }}>
                        Logged in as <strong>{leaderName}</strong>. You have authority to manage course modules, appoint module coordinators, and oversee your batch.
                    </p>
                </div>
            </div>
        </div>
    );
}
