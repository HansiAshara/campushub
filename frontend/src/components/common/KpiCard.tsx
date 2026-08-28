function KpiCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12, padding: "16px 18px",
            flex: 1,
            boxShadow: "var(--shadow-sm)"

        }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text)" }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{label}</div>
        </div>
    );
}

export default KpiCard;