interface KpiCardProps {
    label: string;
    value: string | number;
    subtext?: string;
}

function KpiCard({ label, value, subtext }: KpiCardProps) {
    return (
        <div
            style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: "20px 24px",
                flex: 1,
                boxShadow: "var(--shadow-sm)",
            }}
        >
            <div style={{ fontSize: 13, fontWeight: 500, color: "#64748B", marginBottom: 12 }}>
                {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {value}
            </div>
            {subtext && (
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
                    {subtext}
                </div>
            )}
        </div>
    );
}

export default KpiCard;