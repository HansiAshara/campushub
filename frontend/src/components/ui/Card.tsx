function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: 24,
                boxShadow: "var(--shadow-md)",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export default Card;