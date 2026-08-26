interface BadgeProps {
    children: React.ReactNode;
    tone?: "emerald" | "sage" | "amber" | "muted";
}

function Badge({ children, tone = "emerald" }: BadgeProps) {
    const colors = {
        emerald: { color: "#FFFFFF", backgroundColor: "#10B981" },
        sage: { color: "#047857", backgroundColor: "#D1FAE5" },
        amber: { color: "#92400E", backgroundColor: "#FEF3C7" },
        muted: { color: "#6B7280", backgroundColor: "#F3F4F6" },
    };
    return <span className="stamp" style={colors[tone]}>{children}</span>;
}

export default Badge;