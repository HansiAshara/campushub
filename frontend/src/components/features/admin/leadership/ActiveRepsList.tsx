import { useState, useEffect } from "react";
import { type CourseModerator } from "../../../../types";
import { courseService } from "../../../../api/courseService";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import { Users, UserMinus } from "lucide-react";

interface ActiveRepsListProps {
    onRefresh: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function ActiveRepsList({ onRefresh }: ActiveRepsListProps) {
    const [moderators, setModerators] = useState<CourseModerator[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingMod, setRevokingMod] = useState<CourseModerator | null>(null);
    const [revokeLoading, setRevokeLoading] = useState(false);

    const loadModerators = async () => {
        setLoading(true);
        try {
            const res = await courseService.getAllModerators();
            setModerators(res.data);
        } catch (err) {
            console.error("Failed to load moderators", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadModerators();
    }, []);

    const handleRevoke = async () => {
        if (!revokingMod) return;
        setRevokeLoading(true);
        try {
            await courseService.removeModerator(revokingMod.courseId, revokingMod.userId);
            setRevokingMod(null);
            loadModerators();
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to revoke representative role.");
        } finally {
            setRevokeLoading(false);
        }
    };

    return (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", fontFamily: font }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Users size={18} color="#F59E0B" />
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                        Active Module Coordinators ({moderators.length})
                    </h3>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 36, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                    Loading module coordinators...
                </div>
            ) : moderators.length === 0 ? (
                <div style={{ padding: 36, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                    No module coordinators appointed yet.
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Course</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Batch</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Coordinator</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Index No</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase", textAlign: "right" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moderators.map((m) => (
                            <tr key={m.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                <td style={{ padding: "12px 18px", fontWeight: 700, color: "#0D1B2A" }}>
                                    <span style={{ padding: "2px 6px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, fontSize: 11, marginRight: 6 }}>
                                        {m.courseCode}
                                    </span>
                                    {m.courseName}
                                </td>
                                <td style={{ padding: "12px 18px", color: "#4B5563" }}>
                                    <span style={{ padding: "2px 8px", background: "#ECFDF5", color: "#065F46", borderRadius: 6, fontSize: 11 }}>
                                        {m.batchName}
                                    </span>
                                </td>
                                <td style={{ padding: "12px 18px", fontWeight: 600, color: "#1F2937" }}>
                                    {m.userName}
                                </td>
                                <td style={{ padding: "12px 18px", color: "#4B5563" }}>
                                    {m.userIndexNo || "—"}
                                </td>
                                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                                    <button
                                        onClick={() => setRevokingMod(m)}
                                        style={{
                                            border: "1px solid #FECACA",
                                            background: "#FEF2F2",
                                            color: "#DC2626",
                                            padding: "4px 10px",
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <UserMinus size={13} />
                                        Revoke Coordinator
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ConfirmDeleteDialog
                isOpen={!!revokingMod}
                title="Revoke Module Coordinator?"
                description={`Are you sure you want to remove ${revokingMod?.userName} as the coordinator for ${revokingMod?.courseCode}? If they coordinate no other courses, their role will revert to Student.`}
                confirmText="Yes, Revoke Role"
                loading={revokeLoading}
                onConfirm={handleRevoke}
                onCancel={() => setRevokingMod(null)}
            />
        </div>
    );
}
