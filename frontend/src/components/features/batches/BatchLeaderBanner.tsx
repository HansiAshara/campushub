import { useState } from "react";
import { SubmitBatchQueryModal } from "./SubmitBatchQueryModal";

const font = '"DM Sans", system-ui, sans-serif';

interface BatchLeaderBannerProps {
    batchId: number;
    batchName: string;
    leaderName: string;
    leaderIndexNo?: string | null;
    leaderEmail?: string | null;
}

export function BatchLeaderBanner({ batchId, batchName, leaderName, leaderIndexNo, leaderEmail }: BatchLeaderBannerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const initials = leaderName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    borderLeft: "4px solid #059669",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 24,
                    fontFamily: font,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #064E3B, #059669)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 13,
                            fontWeight: 800,
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#065F46", textTransform: "uppercase", marginBottom: 1 }}>
                            Batch Leader
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#064E3B" }}>
                            {leaderName}
                            {leaderIndexNo && (
                                <span style={{ fontWeight: 500, color: "#059669", marginLeft: 6 }}>
                                    ({leaderIndexNo})
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
                            {leaderEmail || "Contact for batch-wide queries & curriculum access"}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: "#059669",
                            color: "white",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            textDecoration: "none"
                        }}
                    >
                        Contact Leader
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <SubmitBatchQueryModal
                    batchId={batchId}
                    batchName={batchName}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        alert("Query submitted successfully.");
                    }}
                />
            )}
        </>
    );
}
