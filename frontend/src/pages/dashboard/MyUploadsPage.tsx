import { useState } from "react";
import { useMyResources } from "../../hooks/useResources";
import ResourceItem from "../../components/features/resources/ResourceItem";
import { Upload, FileText, Tag as TagIcon, X } from "lucide-react";
import { Link } from "react-router-dom";

function MyUploadsPage() {
    const { resources, loading, refetch } = useMyResources();
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const userName = localStorage.getItem("userName")?.split(" ")[0] || "there";
    const myBatchId = localStorage.getItem("batchId");
    const uploadTargetLink = myBatchId ? `/dashboard/batches/${myBatchId}` : "/dashboard/batches";

    const filteredResources = selectedTag
        ? resources.filter(r => r.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()))
        : resources;

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 40px 60px" }}>

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#10B981", textTransform: "uppercase", marginBottom: 6 }}>My Contributions</p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>
                        {userName}'s uploads
                    </h1>
                    <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                        {loading ? "Loading..." : `You've shared ${resources.length} resource${resources.length !== 1 ? "s" : ""} with your batch`}
                    </p>
                </div>
                <Link to={uploadTargetLink}>
                    <button className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                        <Upload size={14} />
                        Upload to My Batch
                    </button>
                </Link>
            </div>

            {/* Active Tag Filter Banner */}
            {selectedTag && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <TagIcon size={14} color="#047857" />
                        <span style={{ fontSize: 13, color: "#065F46" }}>
                            Filtered by topic: <strong>#{selectedTag}</strong> ({filteredResources.length} matching)
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "white", border: "1px solid #A7F3D0", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#047857", cursor: "pointer" }}
                    >
                        <X size={12} />
                        <span>Clear filter</span>
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ height: 110, background: "white", border: "1px solid #E5E7EB", borderRadius: 12 }} />
                    ))}
                </div>
            ) : filteredResources.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: 16, border: "1.5px dashed #E5E7EB" }}>
                    <FileText size={40} color="#D1D5DB" style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                        {selectedTag ? "No resources matching this topic" : "No uploads yet"}
                    </h3>
                    <p style={{ fontSize: 14, color: "#9CA3AF", maxWidth: 340, margin: "0 auto 20px" }}>
                        {selectedTag ? `No uploaded files have been tagged with #${selectedTag}.` : "You haven't shared anything yet. Be the first to contribute to your batch's resource hub."}
                    </p>
                    {selectedTag ? (
                        <button className="btn-secondary" onClick={() => setSelectedTag(null)}>
                            Clear Topic Filter
                        </button>
                    ) : (
                        <Link to={uploadTargetLink}>
                            <button className="btn-primary">
                                <Upload size={14} />
                                Upload to your batch courses
                            </button>
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {Object.entries(
                        filteredResources.reduce((acc, r) => {
                            const course = r.courseName || "Other Resources";
                            if (!acc[course]) acc[course] = [];
                            acc[course].push(r);
                            return acc;
                        }, {} as Record<string, typeof resources>)
                    ).map(([courseName, courseResources]) => (
                        <div key={courseName}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0D1B2A", marginBottom: 16 }}>
                                {courseName}
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {courseResources.map((r, i) => (
                                    <div key={r.id} style={{ animationDelay: `${i * 0.04}s` }}>
                                        <ResourceItem
                                            resource={r}
                                            onChanged={refetch}
                                            onTagClick={(tag) => setSelectedTag(selectedTag?.toLowerCase() === tag.toLowerCase() ? null : tag)}
                                            activeTag={selectedTag}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyUploadsPage;