import { useState, useEffect } from "react";
import { type Batch } from "../../../../types";
import { batchService } from "../../../../api/batchService";
import { X, Layers } from "lucide-react";

interface EditBatchModalProps {
    batch: Batch | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function EditBatchModal({ batch, isOpen, onClose, onUpdated }: EditBatchModalProps) {
    const [name, setName] = useState("");
    const [intakeYear, setIntakeYear] = useState<number | string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (batch) {
            setName(batch.name);
            setIntakeYear(batch.intakeYear);
            setError("");
        }
    }, [batch]);

    if (!isOpen || !batch) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !intakeYear) return;
        setLoading(true);
        setError("");
        try {
            await batchService.update(batch.id, {
                name: name.trim(),
                intakeYear: Number(intakeYear),
            });
            onUpdated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update batch.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 14,
        fontFamily: font,
        color: "#0D1B2A",
        outline: "none",
        background: "white",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontFamily: font,
        fontSize: 11,
        fontWeight: 700,
        color: "#6B7280",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: 6,
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
                    maxWidth: 440,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Layers size={18} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                            Edit Academic Batch
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Batch Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. 22nd Batch"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Intake Year</label>
                        <input
                            type="number"
                            value={intakeYear}
                            onChange={(e) => setIntakeYear(e.target.value)}
                            required
                            placeholder="e.g. 2022"
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "9px 12px", color: "#DC2626", fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
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
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: "9px 20px", fontSize: 13 }}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
