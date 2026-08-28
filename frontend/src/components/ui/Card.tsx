function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
    return (
        <div
            className={className}
            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-sm)", padding: 20, ...style }}
        >
            {children}
        </div>
    );
}

export default Card;