import { useState } from "react";
import { type Batch } from "../../../../types";
import { batchService } from "../../../../api/batchService";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import { Shield, UserMinus } from "lucide-react";

interface ActiveLeadersListProps {
    batches: Batch[];
    onRefresh: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function ActiveLeadersList({ batches, onRefresh }: ActiveLeadersListProps) {
    const batchesWithLeaders = batches.filter((b) => !!b.leaderName);
    const [removingLeaderBatch, setRemovingLeaderBatch] = useState<Batch | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRemoveLeader = async () => {
        if (!removingLeaderBatch) return;
        setLoading(true);
        try {
            await batchService.removeBatchLeader(removingLeaderBatch.id);
            setRemovingLeaderBatch(null);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to remove batch leader.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", fontFamily: font }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield size={18} color="#8B5CF6" />
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                        Active Batch Leaders ({batchesWithLeaders.length})
                    </h3>
                </div>
            </div>

            {batchesWithLeaders.length === 0 ? (
                <div style={{ padding: 36, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                    No active batch leaders appointed. Use the appointment section above to assign one.
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Batch</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Leader Name</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Index No</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase" }}>Email</th>
                            <th style={{ padding: "10px 18px", fontWeight: 700, color: "#6B7280", fontSize: 11, textTransform: "uppercase", textAlign: "right" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batchesWithLeaders.map((b) => (
                            <tr key={b.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                <td style={{ padding: "12px 18px", fontWeight: 700, color: "#0D1B2A" }}>
                                    <span style={{ padding: "2px 8px", background: "#ECFDF5", color: "#065F46", borderRadius: 6, fontSize: 11 }}>
                                        {b.name}
                                    </span>
                                </td>
                                <td style={{ padding: "12px 18px", fontWeight: 600, color: "#1F2937" }}>
                                    {b.leaderName}
                                </td>
                                <td style={{ padding: "12px 18px", color: "#4B5563" }}>
                                    {b.leaderIndexNo || "—"}
                                </td>
                                <td style={{ padding: "12px 18px", color: "#6B7280" }}>
                                    {b.leaderEmail}
                                </td>
                                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                                    <button
                                        onClick={() => setRemovingLeaderBatch(b)}
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
                                        Revoke Leader
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ConfirmDeleteDialog
                isOpen={!!removingLeaderBatch}
                title="Revoke Batch Leader?"
                description={`Are you sure you want to remove ${removingLeaderBatch?.leaderName} as the Batch Leader for ${removingLeaderBatch?.name}? Their role will be reverted to Student.`}
                confirmText="Yes, Revoke Role"
                loading={loading}
                onConfirm={handleRemoveLeader}
                onCancel={() => setRemovingLeaderBatch(null)}
            />
        </div>
    );
}
