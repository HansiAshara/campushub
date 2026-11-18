import { useEffect, useState } from "react";
import { batchService } from "../../api/batchService";
import { type Batch } from "../../types";
import { useNavigate } from "react-router-dom";
import { formatBatchSubtitle } from "../../utils/batchUtils";
import { ChevronRight, GraduationCap } from "lucide-react";

function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const role = localStorage.getItem("role") || "STUDENT";
    const myBatchId = localStorage.getItem("batchId");

    useEffect(() => {
        batchService.getAll().then((res) => setBatches(res.data || [])).finally(() => setLoading(false));
    }, []);

    const myBatch = batches.find((b) => myBatchId && b.id.toString() === myBatchId.toString());

    return (
        <div>
            {/* ── HEADER SECTION ── */}
            <div style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 40px 0" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#08B981", textTransform: "uppercase", marginBottom: 6 }}>
                    University of Moratuwa · IT
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#142B2A", marginBottom: 6 }}>
                    Academic Batches
                </h1>
                <p style={{ fontSize: 14, color: "#71827B", margin: 0 }}>
                    Browse all available IT batches and view semester courses, notes, and past papers.
                </p>
            </div>

            {/* ── BATCH SELECTOR SECTION ── */}
            <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px" }}>
                
                {/* ── ENROLLED BATCH HUB (For users with an assigned batch from registration) ── */}
                {myBatch && (
                    <div
                        style={{
                            background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                            border: "1.5px solid #A7F3D0",
                            borderRadius: 16,
                            padding: "24px 28px",
                            marginBottom: 36,
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.08)",
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 20,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    background: "#10B981",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
                                }}
                            >
                                <GraduationCap size={26} />
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#047857" }}>
                                        Your Enrolled Batch Hub
                                    </span>
                                    {role === "ADMIN" && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", background: "#FEF2F2", color: "#991B1B", borderRadius: 4 }}>
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0D1B2A", margin: "3px 0 2px" }}>
                                    {myBatch.name}
                                </h3>
                                <p style={{ fontSize: 13, color: "#065F46", margin: 0 }}>
                                    {formatBatchSubtitle(myBatch)} · View your semester courses &amp; upload notes, tutes, or kuppi recordings
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                                onClick={() => navigate(`/dashboard/batches/${myBatch.id}`)}
                                className="btn-primary"
                                style={{
                                    padding: "11px 22px",
                                    fontSize: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                                }}
                            >
                                Enter My Batch Courses
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#0D1B2A" }}>
                        All Academic Batches
                    </h2>
                    <span style={{ fontSize: 14, color: "#9CA3AF" }}>{batches.length} batch{batches.length !== 1 ? "es" : ""} available</span>
                </div>

                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ height: 72, background: "#F3F4F6", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
                        ))}
                    </div>
                ) : batches.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF", fontSize: 14 }}>
                        No batches added yet.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {batches.map((batch) => {
                            const isMyBatch = myBatchId && batch.id.toString() === myBatchId.toString();
                            return (
                                <button
                                    key={batch.id}
                                    onClick={() => navigate(`/dashboard/batches/${batch.id}`)}
                                    className="resource-card fade-in"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        padding: "18px 24px",
                                        textAlign: "left",
                                        width: "100%",
                                        cursor: "pointer",
                                        border: isMyBatch ? "1.5px solid #6EE7B7" : "1px solid #E5E7EB",
                                        background: isMyBatch ? "#F9FDFB" : "white",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 10,
                                            background: isMyBatch ? "#10B981" : "rgba(16,185,129,0.1)",
                                            color: isMyBatch ? "white" : "#10B981",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <GraduationCap size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: "#0D1B2A" }}>
                                                {batch.name}
                                            </span>
                                            {isMyBatch && (
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#ECFDF5", color: "#047857", borderRadius: 6 }}>
                                                    Your Batch
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                                            {formatBatchSubtitle(batch)}
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color="#D1D5DB" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BatchesPage;