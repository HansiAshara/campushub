import { useEffect, useState } from "react";
import { CheckCircle, Clock, Check, MessageSquare } from "lucide-react";
import { courseQueryService } from "../../../api/courseQueryService";
import type { CourseQuery } from "../../../api/courseQueryService";

interface CourseQueriesListProps {
    courseId: number;
}

export function CourseQueriesList({ courseId }: CourseQueriesListProps) {
    const [queries, setQueries] = useState<CourseQuery[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueries = async () => {
        try {
            const res = await courseQueryService.getByCourse(courseId);
            setQueries(res.data);
        } catch (error) {
            console.error("Failed to fetch queries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, [courseId]);

    const handleResolve = async (queryId: number) => {
        try {
            await courseQueryService.resolve(queryId);
            setQueries(queries.map(q => q.id === queryId ? { ...q, status: "RESOLVED" } : q));
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to resolve query.");
        }
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Loading queries...</div>;
    }

    if (queries.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 14, border: "1.5px dashed #E5E7EB", marginTop: 24 }}>
                <MessageSquare size={32} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>No queries from students yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
            {queries.map((q) => (
                <div
                    key={q.id}
                    style={{
                        background: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        padding: 20,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 16,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        fontFamily: '"DM Sans", system-ui, sans-serif'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{
                                background: q.category === "Resource Issue" ? "#FEE2E2" : q.category === "General Suggestion" ? "#DBEAFE" : "#F3F4F6",
                                color: q.category === "Resource Issue" ? "#991B1B" : q.category === "General Suggestion" ? "#1E40AF" : "#374151",
                                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase"
                            }}>
                                {q.category}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                                {q.studentName} {q.studentIndexNo ? `(${q.studentIndexNo})` : ""}
                            </span>
                            <span style={{ fontSize: 12, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
                                <Clock size={12} />
                                {new Date(q.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p style={{ fontSize: 14, color: "#4B5563", margin: 0, lineHeight: 1.5 }}>
                            {q.message}
                        </p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                        {q.status === "OPEN" ? (
                            <button
                                onClick={() => handleResolve(q.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    background: "white", border: "1px solid #D1D5DB",
                                    padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                                    color: "#374151", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                }}
                            >
                                <Check size={16} color="#10B981" />
                                Mark Resolved
                            </button>
                        ) : (
                            <div style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                                color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0"
                            }}>
                                <CheckCircle size={16} />
                                Resolved
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
