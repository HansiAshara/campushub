import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "danger";
    fullWidth?: boolean;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
    primary: { background: "#10B981", color: "white", border: "none" },
    ghost: { background: "white", color: "#374151", border: "1px solid #E5E7EB" },
    danger: { background: "#EF4444", color: "white", border: "none" },
};

function Button({ variant = "primary", fullWidth, style, children, ...rest }: ButtonProps) {
    return (
        <button
            {...rest}
            style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 18px",
                borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "opacity 0.12s, background 0.12s",
                width: fullWidth ? "100%" : undefined,
                ...VARIANT_STYLES[variant],
                ...(rest.disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
                ...style,
            }}
            onMouseEnter={(e) => !rest.disabled && ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
            {children}
        </button>
    );
}

export default Button;