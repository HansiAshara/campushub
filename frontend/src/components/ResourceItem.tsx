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
                padding: "16px 18px",
                marginBottom: 10,
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
            }}
        >
            <div>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 15 }}>
                    {resource.title}
                </a>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                    Uploaded by {resource.uploadedByName} · {date}
                </div>
            </div>
            <Badge tone="chalk">{resource.resourceType.replace("_", " ")}</Badge>
        </div>
    );
}

export default ResourceItem;