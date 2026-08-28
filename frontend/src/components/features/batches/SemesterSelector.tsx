interface Props {
    selectedYear: number;
    selectedSemester: number;
    onSelect: (year: number, semester: number) => void;
}

function SemesterSelector({ selectedYear, selectedSemester, onSelect }: Props) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[1, 2, 3, 4].map((year) =>
                [1, 2].map((sem) => {
                    const active = year === selectedYear && sem === selectedSemester;
                    return (
                        <button key={`${year}-${sem}`} onClick={() => onSelect(year, sem)}
                            style={{
                                padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                                backgroundColor: active ? "var(--color-primary)" : "#fff",
                                color: active ? "#fff" : "var(--color-text)", cursor: "pointer",
                            }}>
                            Year {year} · Sem {sem}
                        </button>
                    );
                })
            )}
        </div>
    );
}

export default SemesterSelector;