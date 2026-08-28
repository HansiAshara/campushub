import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "accent" | "ghost" | "danger";
    fullWidth?: boolean;
}

function Button({ variant = "primary", fullWidth, style, children, ...rest }: ButtonProps) {
    const variants: Record<string, React.CSSProperties> = {
        primary: { backgroundColor: "var(--color-primary)", color: "#fff", border: "1px solid var(--color-primary)" },
        accent: { backgroundColor: "var(--color-accent)", color: "#fff", border: "1px solid var(--color-accent)" },
        ghost: { backgroundColor: "transparent", color: "var(--color-primary-dark)", border: "1px solid var(--color-border)" },
        danger: { backgroundColor: "var(--color-error)", color: "#fff", border: "1px solid var(--color-error)" },
    };

    return (
        <button
            {...rest}
            style={{
                padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
                width: fullWidth ? "100%" : undefined, transition: "opacity 0.15s ease",
                ...variants[variant], ...style,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
            {children}
        </button>
    );
}

export default Button;