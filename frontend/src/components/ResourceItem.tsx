import { type Resource } from "../types";
import Badge from "./ui/Badge";

function ResourceItem({ resource }: { resource: Resource }) {
    const date = new Date(resource.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                marginBottom: 12,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#CBD5E1";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: "#F1F5F9",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                    }}
                >
                    📄
                </div>
                <div>
                    <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}
                    >
                        {resource.title}
                    </a>
                    <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                        Uploaded by <strong style={{ color: "#334155", fontWeight: 600 }}>{resource.uploadedByName}</strong> · {date}
                    </div>
                </div>
            </div>
            <Badge tone="emerald">{resource.resourceType.replace("_", " ")}</Badge>
        </div>
    );
}

export default ResourceItem;