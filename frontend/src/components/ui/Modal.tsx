interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null;
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(31,41,55,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 14, padding: 24, width: 400, maxWidth: "90%", boxShadow: "var(--shadow-card)" }}>
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>{title}</h3>
                {children}
            </div>
        </div>
    );
}

export default Modal;