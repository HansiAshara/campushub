import { useEffect, useState } from "react";
import { batchService } from "../../api/batchService";
import { type Batch } from "../../types";
import { useNavigate } from "react-router-dom";
import { Search, Fingerprint, Sparkles, GitBranch, ChevronRight, GraduationCap } from "lucide-react";

function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        batchService.getAll().then((res) => setBatches(res.data)).finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* ── HERO SECTION ── */}
            <div className="grid-bg" style={{ padding: "60px 0 52px" }}>
                <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#10B981", textTransform: "uppercase", marginBottom: 20 }}>
                        University of Moratuwa · IT
                    </p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 900, color: "#0D1B2A", lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
                        Every tute, paper and kuppi{" "}
                        <span style={{ color: "#10B981" }}>— finally in order.</span>
                    </h1>
                    <p style={{ fontSize: 16, color: "#374151", maxWidth: 520, lineHeight: 1.65, marginBottom: 36 }}>
                        CampusHub replaces chaotic ACA Drive folders with a batch- and semester-scoped
                        hub: content-aware search, SHA-256 duplicate prevention, version threads and AI
                        summaries on every upload.
                    </p>

                    {/* Search bar placeholder */}
                    <div style={{ display: "flex", gap: 0, maxWidth: 560, background: "white", border: "1px solid #D1D5DB", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", flex: 1 }}>
                            <Search size={16} color="#9CA3AF" />
                            <input
                                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#374151", background: "transparent", fontFamily: "var(--font-sans)" }}
                                placeholder='Try "b-trees", "IT3200 past paper", "deadlock prevention"...'
                            />
                        </div>
                        <button className="btn-primary" style={{ borderRadius: 0, borderLeft: "1px solid #E5E7EB", padding: "12px 24px", fontSize: 14 }}>
                            Search
                        </button>
                    </div>

                    {/* Feature cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 36, maxWidth: 720 }}>
                        {[
                            { Icon: Fingerprint, title: "SHA-256 dedupe", desc: "Exact matches short-circuit on upload." },
                            { Icon: Sparkles, title: "AI summaries", desc: "2–3 sentence gist plus topic tags." },
                            { Icon: GitBranch, title: "Version threads", desc: "Revisions link, never fragment." },
                        ].map(({ Icon, title, desc }) => (
                            <div key={title} style={{ background: "white", borderRadius: 12, padding: "18px 20px", border: "1px solid rgba(209, 250, 229, 0.6)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                                <Icon size={22} color="#10B981" style={{ marginBottom: 10 }} />
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A", marginBottom: 4 }}>{title}</div>
                                <div style={{ fontSize: 13, color: "#10B981" }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BATCH SELECTOR SECTION ── */}
            <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 40px 60px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#0D1B2A" }}>
                        Select your Batch
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
                        {batches.map((batch) => (
                            <button
                                key={batch.id}
                                onClick={() => navigate(`/dashboard/batches/${batch.id}`)}
                                className="resource-card fade-in"
                                style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", textAlign: "left", width: "100%", cursor: "pointer", border: "none", background: "white" }}
                            >
                                <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <GraduationCap size={20} color="#10B981" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0D1B2A", marginBottom: 2 }}>{batch.name}</div>
                                    <div style={{ fontSize: 13, color: "#6B7280" }}>Intake {batch.intakeYear}</div>
                                </div>
                                <ChevronRight size={18} color="#D1D5DB" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BatchesPage;