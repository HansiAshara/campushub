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

export function formatRelativeTime(iso: string): string {
    if (!iso) return "Recently uploaded";
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatShortDate(iso);
}