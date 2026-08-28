export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function latestDate(items: { createdAt: string }[]): string {
    if (items.length === 0) return "—";
    const latest = Math.max(...items.map((i) => new Date(i.createdAt).getTime()));
    return formatDate(new Date(latest).toISOString());
}