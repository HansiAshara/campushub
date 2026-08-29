import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function ConfirmDeleteDialog({
    isOpen,
    title,
    description,
    confirmText = "Delete",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDeleteDialogProps) {
    if (!isOpen) return null;

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
            onClick={onCancel}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 24,
                    width: "100%",
                    maxWidth: 420,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: "#FEF2F2",
                                color: "#DC2626",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <AlertTriangle size={20} />
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#9CA3AF",
                            padding: 4,
                            borderRadius: 6,
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5, marginBottom: 24 }}>
                    {description}
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            padding: "9px 18px",
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
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            padding: "9px 20px",
                            borderRadius: 8,
                            border: "none",
                            background: "#DC2626",
                            color: "white",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
