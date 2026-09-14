import { useState } from "react";
import { type Course } from "../../../../types";
import { userService, type UserResponse } from "../../../../api/userService";
import { courseService } from "../../../../api/courseService";
import { Search, UserCheck, Shield, BookOpen } from "lucide-react";

interface LeaderAppointRepSectionProps {
    courses: Course[];
    batchName: string;
    preSelectedCourseId?: number | null;
    onRoleAssigned: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderAppointRepSection({
    courses,
    batchName,
    preSelectedCourseId,
    onRoleAssigned,
}: LeaderAppointRepSectionProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>(
        preSelectedCourseId ? preSelectedCourseId.toString() : courses.length > 0 ? courses[0].id.toString() : ""
    );
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await userService.search(searchQuery.trim());
            setFoundUsers(res.data);
            setSelectedUser(null);
            if (res.data.length === 0) {
                setMessage({ type: "error", text: "No enrolled students found matching your search in this batch." });
            } else {
                setMessage(null);
            }
        } catch (err: any) {
            setMessage({ type: "error", text: "Failed to search students." });
        } finally {
            setSearching(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            setMessage({ type: "error", text: "Please select a student from the search results." });
            return;
        }
        if (!selectedCourseId) {
            setMessage({ type: "error", text: "Please select a course module." });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await courseService.assignModerator(selectedCourseId, selectedUser.id);
            const courseObj = courses.find((c) => c.id.toString() === selectedCourseId);
            const courseDisplay = courseObj ? `${courseObj.code} (${courseObj.name})` : "the module";
            const displayName = selectedUser.indexNo ? `${selectedUser.name} (${selectedUser.indexNo})` : selectedUser.name;

            setMessage({
                type: "success",
                text: `Successfully appointed ${displayName} as Module Coordinator for ${courseDisplay}!`,
            });
            setSelectedUser(null);
            setSearchQuery("");
            setFoundUsers([]);
            onRoleAssigned();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to appoint module coordinator.",
            });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "11px 14px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 14,
        fontFamily: font,
        color: "#0D1B2A",
        outline: "none",
        background: "white",
        boxSizing: "border-box",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontFamily: font,
        fontSize: 11,
        fontWeight: 700,
        color: "#6B7280",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: 6,
    };

    return (
        <div
            style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 24,
                fontFamily: font,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: "#FEF3C7",
                        color: "#B45309",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Shield size={18} />
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D1B2A", margin: 0 }}>
                        Appoint Module Coordinator
                    </h3>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                        Assign student representatives for modules within {batchName || "your batch"}
                    </div>
                </div>
            </div>

            <p style={{ fontSize: 13, color: "#6B7280", margin: "14px 0 20px 0", lineHeight: 1.4 }}>
                Search for an enrolled batch student by name, email, or index number to grant Module Coordinator privileges for a specific course module.
            </p>

            {/* Search Input */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Search student by name, email, or index number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 38 }}
                    />
                    <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: 13, top: 14 }} />
                </div>
                <button
                    type="submit"
                    disabled={searching}
                    className="btn-primary"
                    style={{ padding: "11px 22px", fontSize: 13, flexShrink: 0 }}
                >
                    {searching ? "Searching..." : "Find Student"}
                </button>
            </form>

            {/* Found Users List */}
            {foundUsers.length > 0 && (
                <div
                    style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 10,
                        overflow: "hidden",
                        marginBottom: 20,
                        maxHeight: 220,
                        overflowY: "auto",
                    }}
                >
                    <div style={{ padding: "8px 14px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                        Select a student from results:
                    </div>
                    {foundUsers.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid #F3F4F6",
                                cursor: "pointer",
                                background: selectedUser?.id === u.id ? "#ECFDF5" : "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                transition: "background 0.1s",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A" }}>
                                    {u.name} {u.indexNo && `(${u.indexNo})`}
                                </div>
                                <div style={{ fontSize: 12, color: "#6B7280" }}>
                                    {u.email} {u.academicYear && `· Year ${u.academicYear}`}
                                </div>
                            </div>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    background:
                                        u.role === "BATCH_LEADER"
                                            ? "#F5F3FF"
                                            : u.role === "MODULE_COORDINATOR"
                                            ? "#FEF3C7"
                                            : "#EFF6FF",
                                    color:
                                        u.role === "BATCH_LEADER"
                                            ? "#5B21B6"
                                            : u.role === "MODULE_COORDINATOR"
                                            ? "#92400E"
                                            : "#1E40AF",
                                }}
                            >
                                {u.role === "MODULE_COORDINATOR" ? "COORDINATOR" : u.role === "BATCH_LEADER" ? "LEADER" : u.role}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected User & Assignment Form */}
            {selectedUser && (
                <form onSubmit={handleAssign} style={{ borderTop: "1px solid #F3F4F6", paddingTop: 18 }}>
                    <div
                        style={{
                            background: "#F0FDF4",
                            border: "1px solid #BBF7D0",
                            borderRadius: 10,
                            padding: "12px 16px",
                            marginBottom: 18,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <UserCheck size={20} color="#16A34A" />
                        <div>
                            <div style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", fontWeight: 700 }}>
                                Selected Candidate
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1B2A" }}>
                                {selectedUser.name} {selectedUser.indexNo && `(${selectedUser.indexNo})`}
                            </div>
                            <div style={{ fontSize: 12, color: "#4B5563" }}>{selectedUser.email}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>Assign as Coordinator of Module</label>
                        {courses.length === 0 ? (
                            <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 13, color: "#DC2626" }}>
                                No course modules available in your batch. Please create a module first.
                            </div>
                        ) : (
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                style={inputStyle}
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.name} (Year {c.academicYear}, Sem {c.semesterNumber})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || courses.length === 0}
                        className="btn-primary"
                        style={{
                            padding: "11px 24px",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <BookOpen size={15} />
                        {loading ? "Appointing..." : "Appoint as Module Coordinator"}
                    </button>
                </form>
            )}

            {/* Notification Message */}
            {message && (
                <div
                    style={{
                        marginTop: 18,
                        background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                        color: message.type === "success" ? "#065F46" : "#991B1B",
                        padding: "12px 16px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
