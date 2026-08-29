import { useState } from "react";
import { type Batch } from "../../../../types";
import { Shield, ShieldAlert, Users, BookOpen, MoreVertical, Edit2, Trash2, UserPlus, UserMinus } from "lucide-react";

interface BatchManagementCardProps {
    batch: Batch;
    onEditBatch: (batch: Batch) => void;
    onDeleteBatch: (batch: Batch) => void;
    onAssignLeader: (batch: Batch) => void;
    onRemoveLeader: (batch: Batch) => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function BatchManagementCard({
    batch,
    onEditBatch,
    onDeleteBatch,
    onAssignLeader,
    onRemoveLeader,
}: BatchManagementCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const hasLeader = !!batch.leaderName;

    return (
        <div
            style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                transition: "all 0.15s ease",
                fontFamily: font,
            }}
        >
            {/* Header */}
            <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A", margin: 0, letterSpacing: "-0.01em" }}>
                                {batch.name}
                            </h3>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#ECFDF5", color: "#065F46", borderRadius: 6 }}>
                                Intake {batch.intakeYear}
                            </span>
                        </div>
                    </div>

                    {/* Action dropdown menu */}
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 6,
                                borderRadius: 8,
                                color: "#6B7280",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MoreVertical size={16} />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    style={{ position: "fixed", inset: 0, zIndex: 10 }}
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "100%",
                                        background: "white",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 10,
                                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                                        zIndex: 20,
                                        width: 150,
                                        padding: 4,
                                    }}
                                >
                                    <button
                                        onClick={() => { setMenuOpen(false); onEditBatch(batch); }}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 10px",
                                            border: "none",
                                            background: "transparent",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: "#374151",
                                            cursor: "pointer",
                                            borderRadius: 6,
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <Edit2 size={14} color="#6B7280" />
                                        Edit Batch
                                    </button>
                                    <button
                                        onClick={() => { setMenuOpen(false); onDeleteBatch(batch); }}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 10px",
                                            border: "none",
                                            background: "transparent",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: "#DC2626",
                                            cursor: "pointer",
                                            borderRadius: 6,
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <Trash2 size={14} color="#DC2626" />
                                        Delete Batch
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Batch Leader Info Section */}
                <div
                    style={{
                        background: hasLeader ? "#F5F3FF" : "#F9FAFB",
                        border: `1px solid ${hasLeader ? "#DDD6FE" : "#E5E7EB"}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        marginBottom: 16,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {hasLeader ? <Shield size={14} color="#7C3AED" /> : <ShieldAlert size={14} color="#9CA3AF" />}
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: hasLeader ? "#6D28D9" : "#6B7280" }}>
                                Batch Leader
                            </span>
                        </div>

                        {hasLeader && (
                            <button
                                onClick={() => onRemoveLeader(batch)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "#9CA3AF",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                                title="Remove / Demote Batch Leader"
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.background = "#FEE2E2"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.background = "transparent"; }}
                            >
                                <UserMinus size={12} />
                                Remove
                            </button>
                        )}
                    </div>

                    {hasLeader ? (
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A" }}>
                                {batch.leaderName} {batch.leaderIndexNo && `(${batch.leaderIndexNo})`}
                            </div>
                            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
                                {batch.leaderEmail}
                            </div>
                            <button
                                onClick={() => onAssignLeader(batch)}
                                style={{
                                    marginTop: 8,
                                    border: "1px solid #DDD6FE",
                                    background: "white",
                                    color: "#6D28D9",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                Change Leader
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
                                No leader appointed
                            </span>
                            <button
                                onClick={() => onAssignLeader(batch)}
                                style={{
                                    border: "none",
                                    background: "#10B981",
                                    color: "white",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "5px 12px",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <UserPlus size={13} />
                                Appoint
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics footer */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4B5563" }}>
                    <Users size={14} color="#9CA3AF" />
                    <span><strong>{batch.studentCount ?? 0}</strong> Students</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4B5563" }}>
                    <BookOpen size={14} color="#9CA3AF" />
                    <span><strong>{batch.courseCount ?? 0}</strong> Courses</span>
                </div>
            </div>
        </div>
    );
}
