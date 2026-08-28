import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { batchService } from "../../api/batchService";
import { type Batch } from "../../types";
import { ArrowLeft, UserPlus, FolderPlus, BookOpen, ShieldAlert } from "lucide-react";
import AppointRepTab from "../../components/features/admin/AppointRepTab";
import AddBatchTab from "../../components/features/admin/AddBatchTab";
import AddCourseTab from "../../components/features/admin/AddCourseTab";

const font = '"DM Sans", system-ui, sans-serif';

function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState<"rep" | "batch" | "course">("rep");
    const [batches, setBatches] = useState<Batch[]>([]);
    const role = localStorage.getItem("role") || "STUDENT";

    const refreshBatches = () => {
        batchService.getAll().then((res) => {
            setBatches(res.data);
        });
    };

    useEffect(() => {
        refreshBatches();
    }, []);

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 40px 60px", fontFamily: font }}>
            {/* Breadcrumb */}
            <Link to="/dashboard/batches" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", marginBottom: 28 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
                <ArrowLeft size={14} />
                Back to Batches
            </Link>

            <div style={{ display: "flex", gap: 32 }}>
                {/* ── LEFT TABS SIDEBAR ── */}
                <aside style={{ width: 220, flexShrink: 0 }}>
                    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20, position: "sticky", top: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <ShieldAlert size={16} color="#10B981" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>Admin Panel</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <button
                                onClick={() => setActiveTab("rep")}
                                className={`filter-pill${activeTab === "rep" ? " active" : ""}`}
                                style={{ width: "100%", justifyContent: "flex-start", padding: "8px 14px", fontSize: 13 }}
                            >
                                <UserPlus size={14} style={{ marginRight: 6 }} />
                                Appoint Rep
                            </button>
                            {role === "ADMIN" && (
                                <>
                                    <button
                                        onClick={() => setActiveTab("batch")}
                                        className={`filter-pill${activeTab === "batch" ? " active" : ""}`}
                                        style={{ width: "100%", justifyContent: "flex-start", padding: "8px 14px", fontSize: 13 }}
                                    >
                                        <FolderPlus size={14} style={{ marginRight: 6 }} />
                                        Add Batch
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("course")}
                                        className={`filter-pill${activeTab === "course" ? " active" : ""}`}
                                        style={{ width: "100%", justifyContent: "flex-start", padding: "8px 14px", fontSize: 13 }}
                                    >
                                        <BookOpen size={14} style={{ marginRight: 6 }} />
                                        Add Course
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CONTENT WORKSPACE ── */}
                <div style={{ flex: 1 }}>
                    {activeTab === "rep" && (
                        <AppointRepTab batches={batches} />
                    )}

                    {role === "ADMIN" && activeTab === "batch" && (
                        <AddBatchTab onBatchCreated={refreshBatches} />
                    )}

                    {role === "ADMIN" && activeTab === "course" && (
                        <AddCourseTab batches={batches} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPanelPage;
