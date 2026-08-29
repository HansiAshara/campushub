import { useState } from "react";
import { type Batch } from "../../../../types";
import { userService, type UserResponse } from "../../../../api/userService";
import { batchService } from "../../../../api/batchService";
import { X, Search, ShieldCheck } from "lucide-react";

interface AssignLeaderModalProps {
    batch: Batch | null;
    isOpen: boolean;
    onClose: () => void;
    onAssigned: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AssignLeaderModal({ batch, isOpen, onClose, onAssigned }: AssignLeaderModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [searching, setSearching] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !batch) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        setError("");
        try {
            const res = await userService.search(searchQuery.trim());
            setFoundUsers(res.data);
            setSelectedUser(null);
        } catch (err: any) {
            setError("Failed to search students.");
        } finally {
            setSearching(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedUser) return;
        setAssigning(true);
        setError("");
        try {
            await batchService.assignBatchLeader(batch.id, selectedUser.id);
            onAssigned();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to assign batch leader.");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(13, 27, 42, 0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 16,
                fontFamily: font,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 24,
                    width: "100%",
                    maxWidth: 480,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                                Appoint Batch Leader
                            </h3>
                            <div style={{ fontSize: 12, color: "#6B7280" }}>
                                For {batch.name} (Intake {batch.intakeYear})
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Search box */}
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search by name, email, or index..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "9px 12px 9px 36px",
                                border: "1px solid #E5E7EB",
                                borderRadius: 8,
                                fontSize: 13,
                                fontFamily: font,
                                outline: "none",
                            }}
                        />
                        <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: 12, top: 12 }} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={searching} style={{ padding: "9px 16px", fontSize: 13 }}>
                        {searching ? "..." : "Search"}
                    </button>
                </form>

                {/* Search results list */}
                {foundUsers.length > 0 && (
                    <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, maxHeight: 180, overflowY: "auto", marginBottom: 16 }}>
                        {foundUsers.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                style={{
                                    padding: "10px 14px",
                                    borderBottom: "1px solid #F3F4F6",
                                    cursor: "pointer",
                                    background: selectedUser?.id === u.id ? "#F5F3FF" : "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0D1B2A" }}>
                                        {u.name} {u.indexNo && `(${u.indexNo})`}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#6B7280" }}>{u.email}</div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4 }}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {selectedUser && (
                    <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: 12, marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#065F46", textTransform: "uppercase" }}>Selected Student</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A", marginTop: 2 }}>
                            {selectedUser.name} {selectedUser.indexNo && `(${selectedUser.indexNo})`}
                        </div>
                        <div style={{ fontSize: 12, color: "#4B5563" }}>{selectedUser.email}</div>
                    </div>
                )}

                {error && (
                    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "9px 12px", color: "#DC2626", fontSize: 13, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "9px 16px",
                            borderRadius: 8,
                            border: "1px solid #D1D5DB",
                            background: "white",
                            color: "#374151",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAssign}
                        disabled={!selectedUser || assigning}
                        className="btn-primary"
                        style={{ padding: "9px 20px", fontSize: 13, opacity: !selectedUser ? 0.5 : 1 }}
                    >
                        {assigning ? "Assigning..." : "Confirm Appointment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
