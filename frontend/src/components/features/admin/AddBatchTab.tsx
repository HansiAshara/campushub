import { useState } from "react";
import { batchService } from "../../../api/batchService";

interface AddBatchTabProps {
    onBatchCreated: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AddBatchTab({ onBatchCreated }: AddBatchTabProps) {
    const [batchName, setBatchName] = useState("");
    const [intakeYear, setIntakeYear] = useState("");
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchMessage, setBatchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchName.trim() || !intakeYear) return;
        setBatchLoading(true);
        setBatchMessage(null);
        try {
            await batchService.create({ name: batchName, intakeYear: parseInt(intakeYear) });
            setBatchMessage({ type: "success", text: `Successfully created batch: ${batchName}` });
            setBatchName("");
            setIntakeYear("");
            onBatchCreated();
        } catch (err: any) {
            setBatchMessage({ type: "error", text: err.response?.data?.message || "Failed to create batch." });
        } finally {
            setBatchLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB",
        borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A",
        outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        background: "white",
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontFamily: font, fontSize: 11, fontWeight: 700,
        color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7,
    };

    return (
        <div className="fade-in" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28, fontFamily: font }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>Create Academic Batch</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                Add a new intake batch to group academic materials (e.g. 21st Batch, 22nd Batch).
            </p>

            <form onSubmit={handleCreateBatch} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                    <label style={labelStyle}>Batch Name</label>
                    <input
                        type="text"
                        placeholder="e.g. 21st Batch"
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
                        placeholder="e.g. 2021"
                        value={intakeYear}
                        onChange={(e) => setIntakeYear(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={batchLoading} style={{ padding: "12px 28px", alignSelf: "flex-start" }}>
                    {batchLoading ? "Creating..." : "Create Batch"}
                </button>
            </form>

            {batchMessage && (
                <div style={{
                    marginTop: 20,
                    background: batchMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                    border: `1px solid ${batchMessage.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                    color: batchMessage.type === "success" ? "#065F46" : "#991B1B",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                }}>
                    {batchMessage.text}
                </div>
            )}
        </div>
    );
}
