import { useState } from "react";
import { type CourseModerator } from "../../../../types";
import { courseService } from "../../../../api/courseService";
import ConfirmDeleteDialog from "../../admin/common/ConfirmDeleteDialog";
import { Shield, Trash2 } from "lucide-react";

interface LeaderActiveRepsListProps {
    moderators: CourseModerator[];
    onRefresh: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderActiveRepsList({
    moderators,
    onRefresh,
}: LeaderActiveRepsListProps) {
    const [revokingMod, setRevokingMod] = useState<CourseModerator | null>(null);
    const [revokingLoading, setRevokingLoading] = useState(false);

    const handleRevoke = async () => {
        if (!revokingMod) return;
        setRevokingLoading(true);
        try {
            await courseService.removeModerator(revokingMod.courseId, revokingMod.userId);
            setRevokingMod(null);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to revoke coordinator permissions.");
        } finally {
            setRevokingLoading(false);
        }
    };

    return (
        <div
            style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                fontFamily: font,
            }}
        >
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D1B2A", margin: "0 0 2px 0" }}>
                        Active Module Coordinators
                    </h3>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                        Currently appointed student representatives for modules in your batch
                    </p>
                </div>
                <span
                    style={{
                        padding: "3px 10px",
                        background: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    {moderators.length} {moderators.length === 1 ? "Coordinator" : "Coordinators"}
                </span>
            </div>

            {moderators.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
                    <Shield size={32} color="#D1D5DB" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0", color: "#374151" }}>
                        No Module Coordinators Appointed Yet
                    </p>
                    <p style={{ fontSize: 13, margin: 0, color: "#9CA3AF" }}>
                        Search and appoint students above to delegate moderation duties for course modules.
                    </p>
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                            <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                Module
                            </th>
                            <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                Coordinator
                            </th>
                            <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                Email
                            </th>
                            <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", textAlign: "right" }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {moderators.map((m) => (
                            <tr
                                key={m.id}
                                style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <td style={{ padding: "14px 20px" }}>
                                    <div style={{ fontWeight: 700, color: "#0D1B2A" }}>
                                        <span style={{ padding: "2px 6px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, fontSize: 11, fontWeight: 700, marginRight: 8 }}>
                                            {m.courseCode}
                                        </span>
                                        {m.courseName}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 20px" }}>
                                    <div style={{ fontWeight: 600, color: "#1F2937" }}>
                                        {m.userName}
                                    </div>
                                    {m.userIndexNo && (
                                        <div style={{ fontSize: 11, color: "#6B7280" }}>
                                            Index: {m.userIndexNo}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: "14px 20px", color: "#4B5563" }}>
                                    {m.userEmail}
                                </td>
                                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                    <button
                                        onClick={() => setRevokingMod(m)}
                                        style={{
                                            border: "1px solid #FECACA",
                                            background: "#FEF2F2",
                                            borderRadius: 6,
                                            padding: "5px 10px",
                                            cursor: "pointer",
                                            color: "#DC2626",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            transition: "background 0.15s",
                                        }}
                                        title="Revoke coordinator status"
                                    >
                                        <Trash2 size={12} />
                                        Revoke
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Confirm Revoke Dialog */}
            <ConfirmDeleteDialog
                isOpen={!!revokingMod}
                title="Revoke Coordinator Status?"
                description={`Are you sure you want to remove ${revokingMod?.userName} as Module Coordinator for ${revokingMod?.courseCode} (${revokingMod?.courseName})?`}
                confirmText="Revoke Role"
                loading={revokingLoading}
                onConfirm={handleRevoke}
                onCancel={() => setRevokingMod(null)}
            />
        </div>
    );
}
