import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (open) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKey);
        }
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 9999,
                background: "rgba(13, 27, 42, 0.5)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    borderRadius: 16,
                    width: "100%",
                    maxWidth: 480,
                    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                    animation: "fadeSlideIn 0.2s ease",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F3F4F6" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0D1B2A" }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9CA3AF", borderRadius: 6, transition: "color 0.12s, background 0.12s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div style={{ padding: "24px" }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default Modal;