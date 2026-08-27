interface WelcomeHeaderProps {
    subtitle?: string;
}

function WelcomeHeader({ subtitle }: WelcomeHeaderProps) {
    const userName = localStorage.getItem("userName")?.split(" ")[0] || "there";

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const monthYear = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    return (
        <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F172A" }}>
                {greeting}, {userName} 👋
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                {subtitle || `${monthYear} — here's your academic overview`}
            </p>
        </div>
    );
}

export default WelcomeHeader;