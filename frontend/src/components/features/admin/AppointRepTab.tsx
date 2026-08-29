import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { userService, type UserResponse } from "../../../api/userService";
import { courseService } from "../../../api/courseService";
import { batchService } from "../../../api/batchService";
import { type Batch, type Course } from "../../../types";

interface AppointRepTabProps {
    batches: Batch[];
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AppointRepTab({ batches }: AppointRepTabProps) {
    const role = localStorage.getItem("role") || "STUDENT";
    const myBatchId = localStorage.getItem("batchId");
    
    // Choose what action to perform (Only ADMINs can assign BATCH_LEADER)
    const [appointmentType, setAppointmentType] = useState<"rep" | "leader">("rep");

    // Search and select user
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    // List of courses (grouped by batch)
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    
    // Select batch for Batch Leader assignment
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Load initial batch ID if batches are available
    useEffect(() => {
        if (batches.length > 0) {
            setSelectedBatchId(batches[0].id.toString());
        }
    }, [batches]);

    // Load courses based on logged-in user role
    useEffect(() => {
        if (batches.length > 0) {
            if (role === "BATCH_LEADER" && myBatchId) {
                // Batch leader can only load courses for their own batch
                courseService.getByBatch(myBatchId).then((res) => {
                    setCourses(res.data);
                    if (res.data.length > 0) {
                        setSelectedCourseId(res.data[0].id.toString());
                    }
                });
            } else {
                // Admin loads all courses
                courseService.getByBatch(batches[0].id).then((res) => {
                    setCourses(res.data);
                    if (res.data.length > 0) {
                        setSelectedCourseId(res.data[0].id.toString());
                    }
                });
            }
        }
    }, [batches, role, myBatchId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        userService.search(searchQuery).then((res) => {
            setFoundUsers(res.data);
            setSelectedUser(null);
        });
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setLoading(true);
        setMessage(null);

        try {
            const displayName = selectedUser.indexNo ? `${selectedUser.name} (${selectedUser.indexNo})` : selectedUser.name;

            if (appointmentType === "leader") {
                const batchIdToUse = selectedBatchId || (batches.length > 0 ? batches[0].id.toString() : "");
                if (!batchIdToUse) {
                    setMessage({ type: "error", text: "Please select a batch." });
                    return;
                }
                // Assign Batch Leader
                await batchService.assignBatchLeader(batchIdToUse, selectedUser.id);
                setMessage({
                    type: "success",
                    text: `Successfully appointed ${displayName} as the Batch Leader for this batch!`,
                });
            } else {
                if (!selectedCourseId) {
                    setMessage({ type: "error", text: "Please select a course module." });
                    return;
                }
                // Assign Course/Module Rep
                await courseService.assignModerator(selectedCourseId, selectedUser.id);
                setMessage({
                    type: "success",
                    text: `Successfully appointed ${displayName} as representative for this course!`,
                });
            }
            setSelectedUser(null);
            setSearchQuery("");
            setFoundUsers([]);
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
        width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB",
        borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A",
        outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        background: "white",
    };

    const selectStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB",
        borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A",
        outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        background: "white", cursor: "pointer"
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontFamily: font, fontSize: 11, fontWeight: 700,
        color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7,
    };

    return (
        <div className="fade-in" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28, fontFamily: font }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>Appoint Representative / Leader</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                Search for students and promote them to lead batches or moderate module courses.
            </p>

            {/* Role Assignment Type Selection (Admin only) */}
            {role === "ADMIN" && (
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                    <button
                        onClick={() => { setAppointmentType("rep"); setSelectedUser(null); setMessage(null); }}
                        className={`filter-pill${appointmentType === "rep" ? " active" : ""}`}
                        style={{ fontSize: 13, padding: "7px 16px" }}
                    >
                        Appoint Module Rep
                    </button>
                    <button
                        onClick={() => { setAppointmentType("leader"); setSelectedUser(null); setMessage(null); }}
                        className={`filter-pill${appointmentType === "leader" ? " active" : ""}`}
                        style={{ fontSize: 13, padding: "7px 16px" }}
                    >
                        Appoint Batch Leader
                    </button>
                </div>
            )}

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Search student by name, email or index..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 40 }}
                    />
                    <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: 14, top: 15 }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "11px 24px" }}>
                    Search
                </button>
            </form>

            {/* Found Users List */}
            {foundUsers.length > 0 && (
                <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden", marginBottom: 24, maxHeight: 200, overflowY: "auto" }}>
                    {foundUsers.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => {
                                setSelectedUser(u);
                                if (u.batchId) {
                                    setSelectedBatchId(u.batchId.toString());
                                } else if (batches.length > 0 && !selectedBatchId) {
                                    setSelectedBatchId(batches[0].id.toString());
                                }
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
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#0D1B2A" }}>
                                    {u.name} {u.indexNo && `(${u.indexNo})`}
                                </div>
                                <div style={{ fontSize: 12, color: "#6B7280" }}>
                                    {u.email} {u.batchName && `· ${u.batchName}`} {u.academicYear && `· Year ${u.academicYear}`}
                                </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", background: u.role === "ADMIN" ? "#FEF2F2" : u.role === "BATCH_LEADER" ? "#F5F3FF" : u.role === "MODULE_REP" ? "#FEF3C7" : "#EFF6FF", color: u.role === "ADMIN" ? "#991B1B" : u.role === "BATCH_LEADER" ? "#5B21B6" : u.role === "MODULE_REP" ? "#92400E" : "#1E40AF", borderRadius: 4 }}>
                                {u.role === "BATCH_LEADER" ? "LEADER" : u.role === "MODULE_REP" ? "REP" : u.role}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Assignment form */}
            {selectedUser && (
                <form onSubmit={handleAssign} style={{ borderTop: "1px solid #F3F4F6", paddingTop: 20 }}>
                    <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: 14, marginBottom: 20 }}>
                        <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 700 }}>
                            Selected Student
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0D1B2A", marginTop: 2 }}>
                            {selectedUser.name} {selectedUser.indexNo && `(${selectedUser.indexNo})`}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{selectedUser.email}</div>
                    </div>

                    {appointmentType === "leader" ? (
                        /* Appoint Batch Leader selection fields */
                        <div style={{ marginBottom: 24 }}>
                            <label style={labelStyle}>Assign as Leader of Batch</label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                style={selectStyle}
                            >
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} (Intake {b.intakeYear})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        /* Appoint Module Rep fields */
                        <div style={{ marginBottom: 24 }}>
                            <label style={labelStyle}>Assign as Rep of Course Module</label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                style={selectStyle}
                            >
                                {role === "BATCH_LEADER" ? (
                                    /* Leader can only assign reps to courses within their own batch */
                                    courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.code} - {c.name}
                                        </option>
                                    ))
                                ) : (
                                    /* Admin can assign reps to any courses of any batches */
                                    batches.map((b) => (
                                        <optgroup key={b.id} label={`${b.name} (Intake ${b.intakeYear})`}>
                                            {courses
                                                .filter((c) => c.batchName === b.name)
                                                .map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.code} - {c.name}
                                                    </option>
                                                ))}
                                        </optgroup>
                                    ))
                                )}
                            </select>
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px 28px" }}>
                        {loading ? "Assigning..." : appointmentType === "leader" ? "Appoint Batch Leader" : "Appoint Course Rep"}
                    </button>
                </form>
            )}

            {message && (
                <div style={{
                    marginTop: 20,
                    background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
                    border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                    color: message.type === "success" ? "#065F46" : "#991B1B",
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                }}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
