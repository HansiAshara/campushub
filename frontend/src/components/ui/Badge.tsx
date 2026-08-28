interface BadgeProps {
    children: React.ReactNode;
    tone?: "primary" | "accent" | "muted";
}

function Badge({ children, tone = "primary" }: BadgeProps) {
    const styles: Record<string, React.CSSProperties> = {
        primary: { color: "var(--color-primary-dark)", backgroundColor: "var(--color-secondary)" },
        accent: { color: "#92400E", backgroundColor: "#FEF3C7" },
        muted: { color: "var(--color-text-muted)", backgroundColor: "#F3F4F6" },
    };
    return <span className="stamp" style={styles[tone]}>{children}</span>;
}

export default Badge;