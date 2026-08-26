import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, style, ...rest }, ref) => (
    <div style={{ marginBottom: 20 }}>
        {label && (
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#334155" }}>
                {label}
            </label>
        )}
        <input
            ref={ref}
            {...rest}
            style={{
                display: "block",
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                outline: "none",
                transition: "all 0.15s ease",
                ...style,
            }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.15)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
            }}
        />
    </div>
));

export default Input;