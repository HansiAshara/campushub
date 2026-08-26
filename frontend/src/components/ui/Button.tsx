import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ink" | "chalk" | "ghost";
    fullWidth?: boolean;
}

function Button({ variant = "ink", fullWidth, style, children, ...rest }: ButtonProps) {
    const variants = {
        ink: {
            backgroundColor: "#10B981",
            color: "#FFFFFF",
            border: "none",
        },
        chalk: {
            backgroundColor: "#10B981",
            color: "#FFFFFF",
            border: "none",
        },
        ghost: {
            backgroundColor: "#FFFFFF",
            color: "#047857",
            border: "1px solid #D1FAE5",
        },
    };

    return (
        <button
            {...rest}
            style={{
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 14,
                width: fullWidth ? "100%" : undefined,
                transition: "all 0.15s ease",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                ...variants[variant],
                ...style,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = variant === "ghost" ? "#D1FAE5" : "#047857";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = variants[variant].backgroundColor;
            }}
        >
            {children}
        </button>
    );
}

export default Button;