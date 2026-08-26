interface BadgeProps {
    children: React.ReactNode;
    tone?: "chalk" | "ink" | "muted";
}

function Badge({ children, tone = "chalk" }: BadgeProps) {
    const colors = {
        chalk: { color: "var(--color-ink)", backgroundColor: "#FBEFD1" },
        ink: { color: "#fff", backgroundColor: "var(--color-ink)" },
        muted: { color: "var(--color-text-muted)", backgroundColor: "transparent" },
    };
    return <span className="stamp" style={colors[tone]}>{children}</span>;
}

export default Badge;