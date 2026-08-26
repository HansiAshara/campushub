function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: 20,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export default Card;