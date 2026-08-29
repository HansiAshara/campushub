import { useState } from "react";
import { batchService } from "../../../../api/batchService";
import { FolderPlus, CheckCircle2 } from "lucide-react";

interface AddBatchFormProps {
    onBatchCreated: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AddBatchForm({ onBatchCreated }: AddBatchFormProps) {
    const [batchName, setBatchName] = useState("");
    const [intakeYear, setIntakeYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchName.trim() || !intakeYear) return;
        setLoading(true);
        setMessage(null);
        try {
            await batchService.create({ name: batchName.trim(), intakeYear: parseInt(intakeYear) });
            setMessage({ type: "success", text: `Successfully created batch: ${batchName.trim()}` });
            setBatchName("");
            setIntakeYear("");
            onBatchCreated();
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to create batch." });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "11px 14px",
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
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, fontFamily: font }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#ECFDF5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FolderPlus size={18} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                    Create Academic Batch
                </h3>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px 0" }}>
                Add a new student intake batch (e.g., 22nd Batch, 23rd Batch) to organize academic courses and materials.
            </p>

            <form onSubmit={handleCreateBatch} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                    <label style={labelStyle}>Batch Name</label>
                    <input
                        type="text"
                        placeholder="e.g. 23rd Batch"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Intake Year</label>
                    <input
                        type="number"
                        placeholder="e.g. 2023"
                        value={intakeYear}
                        onChange={(e) => setIntakeYear(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ padding: "10px 24px", alignSelf: "flex-start", fontSize: 13 }}
                >
                    {loading ? "Creating..." : "Create Batch"}
                </button>
            </form>

            {message && (
                <div
                    style={{
                        marginTop: 18,
                        background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                        color: message.type === "success" ? "#065F46" : "#DC2626",
                        padding: "11px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {message.type === "success" && <CheckCircle2 size={16} color="#10B981" />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
