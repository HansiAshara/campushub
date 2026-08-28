function WelcomeHeader({ subtitle }: { subtitle?: string }) {
    const userName = localStorage.getItem("userName")?.split(" ")[0] || "there";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const monthYear = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    return (
        <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26 }}>{greeting}, {userName} 👋</h1>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginTop: 4 }}>
                {subtitle || `${monthYear} — here's your academic overview`}
            </p>
        </div>
    );
}

export default WelcomeHeader;