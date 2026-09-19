import { useState } from "react";
import { X, Send } from "lucide-react";
import { batchQueryService } from "../../../api/batchQueryService";

interface SubmitBatchQueryModalProps {
    batchId: number;
    batchName: string;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = [
    "Module Request",
    "Coordinator Nomination",
    "Inactive Coordinator Report",
    "General Batch Concern",
    "Other"
];

export function SubmitBatchQueryModal({ batchId, batchName, onClose, onSuccess }: SubmitBatchQueryModalProps) {
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            await batchQueryService.create(batchId, { category, message });
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to submit query.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(13, 27, 42, 0.4)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 20
        }}>
            <div style={{
                background: "white", borderRadius: 16, width: "100%", maxWidth: 500,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                fontFamily: '"DM Sans", system-ui, sans-serif',
                overflow: "hidden"
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F3F4F6", background: "#ECFDF5" }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#064E3B", margin: 0 }}>Contact Batch Leader</h2>
                        <p style={{ fontSize: 13, color: "#059669", margin: "4px 0 0" }}>{batchName}</p>
                    </div>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#059669" }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: "100%", padding: "10px 14px", borderRadius: 8,
                                border: "1px solid #D1D5DB", fontSize: 14, color: "#1F2937",
                                backgroundColor: "white", outline: "none",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your issue or suggestion in detail..."
                            rows={4}
                            required
                            style={{
                                width: "100%", padding: "12px 14px", borderRadius: 8,
                                border: "1px solid #D1D5DB", fontSize: 14, color: "#1F2937",
                                backgroundColor: "white", outline: "none", resize: "vertical",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 16px", borderRadius: 8, border: "1px solid #D1D5DB",
                                background: "white", color: "#4B5563", fontSize: 14, fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 20px", borderRadius: 8, border: "none",
                                background: isSubmitting ? "#6EE7B7" : "#059669", color: "white",
                                fontSize: 14, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                        >
                            <Send size={16} />
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
