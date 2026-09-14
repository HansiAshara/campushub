import { useState } from "react";
import { type UserResponse } from "../../../../api/userService";
import { Search, Users } from "lucide-react";

interface LeaderBatchStudentsListProps {
    students: UserResponse[];
    batchName: string;
    loading?: boolean;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function LeaderBatchStudentsList({
    students,
    batchName,
    loading = false,
}: LeaderBatchStudentsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");

    const filteredStudents = students.filter((u) => {
        const matchesQuery =
            (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.indexNo && u.indexNo.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

        return matchesQuery && matchesRole;
    });

    const selectStyle: React.CSSProperties = {
        padding: "8px 12px",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 13,
        fontFamily: font,
        color: "#374151",
        background: "white",
        outline: "none",
        cursor: "pointer",
    };

    return (
        <div style={{ fontFamily: font }}>
            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, flex: 1 }}>
                    <div style={{ position: "relative", minWidth: 240, flex: 1, maxWidth: 360 }}>
                        <input
                            type="text"
                            placeholder="Search students by name, email, or index..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px 8px 34px",
                                border: "1px solid #E5E7EB",
                                borderRadius: 8,
                                fontSize: 13,
                                fontFamily: font,
                                outline: "none",
                                background: "white",
                                boxSizing: "border-box",
                            }}
                        />
                        <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: 11, top: 11 }} />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="STUDENT">Students</option>
                        <option value="MODULE_COORDINATOR">Module Coordinators</option>
                        <option value="BATCH_LEADER">Batch Leaders</option>
                    </select>
                </div>

                <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                    Showing {filteredStudents.length} of {students.length} students enrolled in {batchName}
                </div>
            </div>

            {/* Students Table */}
            <div
                style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
            >
                {loading ? (
                    <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
                        Loading batch students directory...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center", color: "#6B7280" }}>
                        <Users size={32} color="#D1D5DB" style={{ marginBottom: 10 }} />
                        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px 0", color: "#374151" }}>
                            No students match your query
                        </p>
                        <p style={{ fontSize: 13, margin: 0, color: "#9CA3AF" }}>
                            Try searching with a different name, email, or index number.
                        </p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                                <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Student Name
                                </th>
                                <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Index Number
                                </th>
                                <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Email Address
                                </th>
                                <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                                    Academic Year
                                </th>
                                <th style={{ padding: "12px 20px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", textAlign: "right" }}>
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((u) => {
                                const initials = (u.name || "S")
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <tr
                                        key={u.id}
                                        style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: "50%",
                                                        background: u.role === "BATCH_LEADER" ? "#8B5CF6" : u.role === "MODULE_COORDINATOR" ? "#F59E0B" : "#10B981",
                                                        color: "white",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {initials}
                                                </div>
                                                <div style={{ fontWeight: 700, color: "#0D1B2A" }}>
                                                    {u.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "#374151", fontWeight: 600 }}>
                                            {u.indexNo ? (
                                                <span style={{ padding: "2px 8px", background: "#F3F4F6", borderRadius: 6, fontSize: 12 }}>
                                                    {u.indexNo}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#9CA3AF" }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "#4B5563" }}>
                                            {u.email}
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "#6B7280" }}>
                                            {u.academicYear ? `Year ${u.academicYear}` : "—"}
                                        </td>
                                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    padding: "3px 9px",
                                                    borderRadius: 6,
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
                                                {u.role === "BATCH_LEADER"
                                                    ? "BATCH LEADER"
                                                    : u.role === "MODULE_COORDINATOR"
                                                    ? "COORDINATOR"
                                                    : "STUDENT"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
