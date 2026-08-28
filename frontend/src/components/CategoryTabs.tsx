const CATEGORIES = [
    { value: "ALL", label: "All" },
    { value: "SLIDES", label: "Slides" },
    { value: "NOTES", label: "Notes" },
    { value: "KUPPI_NOTES", label: "Kuppi" },
    { value: "TUTE", label: "Tutes" },
    { value: "PAST_PAPER", label: "Past Papers" },
];

interface CategoryTabsProps {
    active: string;
    onChange: (value: string) => void;
}

function CategoryTabs({ active, onChange }: CategoryTabsProps) {
    return (
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #E6E1D3", marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => onChange(cat.value)}
                    style={{
                        padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                        background: "none", border: "none",
                        borderBottom: active === cat.value ? "2px solid #EC7F49" : "2px solid transparent",
                        color: active === cat.value ? "#232A25" : "#7C8578",
                    }}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}

export default CategoryTabs;