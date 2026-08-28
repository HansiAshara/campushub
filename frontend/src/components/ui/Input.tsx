import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, style, ...rest }, ref) => (
    <div style={{ marginBottom: 16 }}>
        {label && (
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8 }}>
                {label}
            </label>
        )}
        <input
            ref={ref}
            {...rest}
            style={{
                width: "100%", padding: "10px 14px",
                border: `1px solid ${error ? "#FCA5A5" : "#E5E7EB"}`,
                borderRadius: 8, fontSize: 14,
                color: "#0D1B2A", outline: "none",
                transition: "border-color 0.15s",
                background: "white",
                fontFamily: "var(--font-sans)",
                ...style,
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = error ? "#EF4444" : "#10B981"; rest.onFocus?.(e); }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = error ? "#FCA5A5" : "#E5E7EB"; rest.onBlur?.(e); }}
        />
        {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</p>}
    </div>
));

Input.displayName = "Input";
export default Input;