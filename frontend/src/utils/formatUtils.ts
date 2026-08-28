export function formatCategory(resourceType: string): string {
    return resourceType.replace("_", " ");
}

export function initials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function topCategory(resources: { resourceType: string }[]): string {
    if (resources.length === 0) return "—";
    const counts: Record<string, number> = {};
    resources.forEach((r) => { counts[r.resourceType] = (counts[r.resourceType] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return formatCategory(top);
}