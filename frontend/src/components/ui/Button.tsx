import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ink" | "chalk" | "ghost";
    fullWidth?: boolean;
}

function Button({ variant = "ink", fullWidth, style, children, ...rest }: ButtonProps) {
    const variants = {
        ink: { backgroundColor: "var(--color-ink)", color: "#fff", border: "1px solid var(--color-ink)" },
        chalk: { backgroundColor: "var(--color-chalk)", color: "var(--color-ink)", border: "1px solid var(--color-chalk)" },
        ghost: { backgroundColor: "transparent", color: "var(--color-ink)", border: "1px solid var(--color-border)" },
    };

    return (
        <button
            {...rest}
            style={{
                padding: "11px 20px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 14,
                width: fullWidth ? "100%" : undefined,
                transition: "opacity 0.15s ease",
                ...variants[variant],
                ...style,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
            {children}
        </button>
    );
}

export default Button;