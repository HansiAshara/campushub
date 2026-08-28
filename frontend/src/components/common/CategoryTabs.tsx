const CATEGORIES = [
    { value: "ALL", label: "All" },
    { value: "SLIDES", label: "Slides" },
    { value: "NOTES", label: "Notes" },
    { value: "KUPPI_NOTES", label: "Kuppi" },
    { value: "TUTE", label: "Tutes" },
    { value: "PAST_PAPER", label: "Past Papers" },
];

function CategoryTabs({ active, onChange }: { active: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--color-border)", marginBottom: 20, overflowX: "auto" }}>
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => onChange(cat.value)}
                    style={{
                        padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                        background: "none", border: "none", whiteSpace: "nowrap",
                        borderBottom: active === cat.value ? "2px solid var(--color-accent)" : "2px solid transparent",
                        color: active === cat.value ? "var(--color-text)" : "var(--color-text-muted)",
                    }}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}

export default CategoryTabs;