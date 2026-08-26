function KpiCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div
            style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "18px 20px",
                flex: 1,
            }}
        >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "var(--color-ink)" }}>
                {value}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: 4 }}>
                {label}
            </div>
        </div>
    );
}

export default KpiCard;