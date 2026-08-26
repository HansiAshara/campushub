import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, style, ...rest }, ref) => (
    <div style={{ marginBottom: 16 }}>
        {label && (
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--color-text-muted)" }}>
                {label}
            </label>
        )}
        <input
            ref={ref}
            {...rest}
            style={{
                display: "block",
                width: "100%",
                padding: "11px 12px",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                backgroundColor: "#fff",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                ...style,
            }}
        />
    </div>
));

export default Input;