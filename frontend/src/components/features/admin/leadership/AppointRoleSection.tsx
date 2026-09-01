import { useState, useEffect } from "react";
import { Search, UserCheck } from "lucide-react";
import { userService, type UserResponse } from "../../../../api/userService";
import { courseService } from "../../../../api/courseService";
import { batchService } from "../../../../api/batchService";
import { type Batch, type Course } from "../../../../types";

interface AppointRoleSectionProps {
    batches: Batch[];
    onRoleAssigned: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AppointRoleSection({ batches, onRoleAssigned }: AppointRoleSectionProps) {
    const role = localStorage.getItem("role") || "STUDENT";
    const myBatchId = localStorage.getItem("batchId");

    const [appointmentType, setAppointmentType] = useState<"leader" | "rep">("leader");
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (batches.length > 0 && !selectedBatchId) {
            setSelectedBatchId(batches[0].id.toString());
        }
    }, [batches]);

    useEffect(() => {
        if (batches.length > 0) {
            if (role === "BATCH_LEADER" && myBatchId) {
                courseService.getByBatch(myBatchId).then((res) => {
                    setCourses(res.data);
                    if (res.data.length > 0) setSelectedCourseId(res.data[0].id.toString());
                });
            } else {
                courseService.getAll().then((res) => {
                    setCourses(res.data);
                    if (res.data.length > 0) setSelectedCourseId(res.data[0].id.toString());
                });
            }
        }
    }, [batches, role, myBatchId]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setMessage(null);
        try {
            const res = await userService.search(searchQuery.trim());
            setFoundUsers(res.data);
            setSelectedUser(null);
        } catch {
            setMessage({ type: "error", text: "Failed to search students." });
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setLoading(true);
        setMessage(null);

        const displayName = selectedUser.indexNo ? `${selectedUser.name} (${selectedUser.indexNo})` : selectedUser.name;

        try {
            if (appointmentType === "leader") {
                const batchIdToUse = selectedBatchId || (batches.length > 0 ? batches[0].id.toString() : "");
                if (!batchIdToUse) {
                    setMessage({ type: "error", text: "Please select a batch." });
                    return;
                }
                await batchService.assignBatchLeader(batchIdToUse, selectedUser.id);
                setMessage({
                    type: "success",
                    text: `Successfully appointed ${displayName} as Batch Leader!`,
                });
            } else {
                if (!selectedCourseId) {
                    setMessage({ type: "error", text: "Please select a course module." });
                    return;
                }
                await courseService.assignModerator(selectedCourseId, selectedUser.id);
                setMessage({
                    type: "success",
                    text: `Successfully appointed ${displayName} as Module Coordinator!`,
                });
            }

            setSelectedUser(null);
            setSearchQuery("");
            setFoundUsers([]);
            onRoleAssigned();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to perform role assignment.",
            });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 14,
        fontFamily: font,
        color: "#0D1B2A",
        outline: "none",
        background: "white",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontFamily: font,
        fontSize: 11,
        fontWeight: 700,
        color: "#9CA3AF",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: 6,
    };

    return (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, fontFamily: font }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0D1B2A", margin: "0 0 6px 0" }}>
                Appoint Leadership Role
            </h3>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px 0" }}>
                Search for an enrolled student by name, email, or index number to grant administrative privileges.
            </p>

            {/* Role selector pills */}
            {role === "ADMIN" && (
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <button
                        type="button"
                        onClick={() => { setAppointmentType("leader"); setSelectedUser(null); setMessage(null); }}
                        className={`filter-pill${appointmentType === "leader" ? " active" : ""}`}
                        style={{ fontSize: 13, padding: "7px 16px" }}
                    >
                        Appoint Batch Leader
                    </button>
                    <button
                        type="button"
                        onClick={() => { setAppointmentType("rep"); setSelectedUser(null); setMessage(null); }}
                        className={`filter-pill${appointmentType === "rep" ? " active" : ""}`}
                        style={{ fontSize: 13, padding: "7px 16px" }}
                    >
                        Appoint Module Coordinator
                    </button>
                </div>
            )}

            {/* Search form */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Search student by name, email, or index number (e.g. 234010A)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 38 }}
                    />
                    <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: 14, top: 14 }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
                    Search
                </button>
            </form>

            {/* Search results */}
            {foundUsers.length > 0 && (
                <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden", marginBottom: 20, maxHeight: 220, overflowY: "auto" }}>
                    {foundUsers.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => {
                                setSelectedUser(u);
                                if (u.batchId) setSelectedBatchId(u.batchId.toString());
                            }}
                            style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid #F3F4F6",
                                cursor: "pointer",
                                background: selectedUser?.id === u.id ? "#ECFDF5" : "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A" }}>
                                    {u.name} {u.indexNo && `(${u.indexNo})`}
                                </div>
                                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
                                    {u.email} {u.batchName && `· ${u.batchName}`} {u.academicYear && `· Year ${u.academicYear}`}
                                </div>
                            </div>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: u.role === "ADMIN" ? "#FEF2F2" : u.role === "BATCH_LEADER" ? "#F5F3FF" : u.role === "MODULE_COORDINATOR" ? "#FEF3C7" : "#EFF6FF",
                                color: u.role === "ADMIN" ? "#991B1B" : u.role === "BATCH_LEADER" ? "#6D28D9" : u.role === "MODULE_COORDINATOR" ? "#92400E" : "#1D4ED8",
                            }}>
                                {u.role === "MODULE_COORDINATOR" ? "COORDINATOR" : u.role}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Form for selected user */}
            {selectedUser && (
                <form onSubmit={handleAssign} style={{ borderTop: "1px solid #F3F4F6", paddingTop: 18, marginTop: 12 }}>
                    <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
                        <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 700 }}>
                            Target Candidate
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#0D1B2A", marginTop: 2 }}>
                            {selectedUser.name} {selectedUser.indexNo && `(${selectedUser.indexNo})`}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{selectedUser.email}</div>
                    </div>

                    {appointmentType === "leader" ? (
                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Assign as Leader of Batch</label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                style={{ ...inputStyle, cursor: "pointer" }}
                            >
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} (Intake {b.intakeYear})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Assign as Coordinator for Course Module</label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                style={{ ...inputStyle, cursor: "pointer" }}
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        [{c.batchName}] {c.code} - {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: "10px 24px", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <UserCheck size={16} />
                        {loading ? "Assigning..." : appointmentType === "leader" ? "Appoint Batch Leader" : "Appoint Module Coordinator"}
                    </button>
                </form>
            )}

            {/* Message alert */}
            {message && (
                <div
                    style={{
                        marginTop: 18,
                        background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                        color: message.type === "success" ? "#065F46" : "#DC2626",
                        padding: "12px 16px",
                        borderRadius: 8,
                        fontSize: 13,
                    }}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
