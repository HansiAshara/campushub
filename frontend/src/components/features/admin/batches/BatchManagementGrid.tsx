import { useState } from "react";
import { type Batch } from "../../../../types";
import { batchService } from "../../../../api/batchService";
import BatchManagementCard from "./BatchManagementCard";
import EditBatchModal from "./EditBatchModal";
import AssignLeaderModal from "./AssignLeaderModal";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import { Search, Plus } from "lucide-react";

interface BatchManagementGridProps {
    batches: Batch[];
    onRefresh: () => void;
    onOpenAddBatch: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function BatchManagementGrid({
    batches,
    onRefresh,
    onOpenAddBatch,
}: BatchManagementGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modals state
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [assigningBatch, setAssigningBatch] = useState<Batch | null>(null);
    
    // Confirm delete batch
    const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Confirm remove leader
    const [removingLeaderBatch, setRemovingLeaderBatch] = useState<Batch | null>(null);
    const [removeLeaderLoading, setRemoveLeaderLoading] = useState(false);

    const filteredBatches = batches.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.intakeYear.toString().includes(searchQuery) ||
        (b.leaderName && b.leaderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.leaderIndexNo && b.leaderIndexNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleDeleteBatch = async () => {
        if (!deletingBatch) return;
        setDeleteLoading(true);
        try {
            await batchService.delete(deletingBatch.id);
            setDeletingBatch(null);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete batch.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRemoveLeader = async () => {
        if (!removingLeaderBatch) return;
        setRemoveLeaderLoading(true);
        try {
            await batchService.removeBatchLeader(removingLeaderBatch.id);
            setRemovingLeaderBatch(null);
            onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to remove batch leader.");
        } finally {
            setRemoveLeaderLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: font }}>
            {/* Action toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                    <input
                        type="text"
                        placeholder="Search batches by name, year, or leader..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "9px 14px 9px 36px",
                            border: "1px solid #E5E7EB",
                            borderRadius: 10,
                            fontSize: 13,
                            fontFamily: font,
                            outline: "none",
                            background: "white",
                        }}
                    />
                    <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: 12, top: 12 }} />
                </div>

                <button
                    onClick={onOpenAddBatch}
                    className="btn-primary"
                    style={{ padding: "9px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                >
                    <Plus size={15} />
                    New Batch
                </button>
            </div>

            {/* Grid of batch cards */}
            {filteredBatches.length === 0 ? (
                <div
                    style={{
                        background: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: 14,
                        padding: 48,
                        textAlign: "center",
                        color: "#6B7280",
                    }}
                >
                    <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px 0", color: "#374151" }}>
                        No batches found
                    </p>
                    <p style={{ fontSize: 13, margin: 0 }}>
                        {searchQuery ? "Try refining your search query." : "Click 'New Batch' above to create your first batch."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                    {filteredBatches.map((b) => (
                        <BatchManagementCard
                            key={b.id}
                            batch={b}
                            onEditBatch={(batch) => setEditingBatch(batch)}
                            onDeleteBatch={(batch) => setDeletingBatch(batch)}
                            onAssignLeader={(batch) => setAssigningBatch(batch)}
                            onRemoveLeader={(batch) => setRemovingLeaderBatch(batch)}
                        />
                    ))}
                </div>
            )}

            {/* Edit Batch Modal */}
            <EditBatchModal
                batch={editingBatch}
                isOpen={!!editingBatch}
                onClose={() => setEditingBatch(null)}
                onUpdated={onRefresh}
            />

            {/* Assign Leader Modal */}
            <AssignLeaderModal
                batch={assigningBatch}
                isOpen={!!assigningBatch}
                onClose={() => setAssigningBatch(null)}
                onAssigned={onRefresh}
            />

            {/* Confirm Delete Batch Dialog */}
            <ConfirmDeleteDialog
                isOpen={!!deletingBatch}
                title="Delete Academic Batch?"
                description={`Are you sure you want to delete ${deletingBatch?.name}? Courses and enrolled students will be unlinked.`}
                confirmText="Yes, Delete Batch"
                loading={deleteLoading}
                onConfirm={handleDeleteBatch}
                onCancel={() => setDeletingBatch(null)}
            />

            {/* Confirm Remove Leader Dialog */}
            <ConfirmDeleteDialog
                isOpen={!!removingLeaderBatch}
                title="Remove Batch Leader?"
                description={`Are you sure you want to remove ${removingLeaderBatch?.leaderName} as the Batch Leader for ${removingLeaderBatch?.name}? Their role will revert to Student.`}
                confirmText="Yes, Remove Leader"
                loading={removeLeaderLoading}
                onConfirm={handleRemoveLeader}
                onCancel={() => setRemovingLeaderBatch(null)}
            />
        </div>
    );
}
