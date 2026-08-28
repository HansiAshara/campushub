import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { batchService } from "../../api/batchService";
import { courseService } from "../../api/courseService";
import { userService, type UserResponse } from "../../api/userService";
import { type Batch, type Course } from "../../types";
import { ArrowLeft, UserPlus, FolderPlus, BookOpen, Search, ShieldAlert } from "lucide-react";

const font = '"DM Sans", system-ui, sans-serif';

function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState<"rep" | "batch" | "course">("rep");
    const [batches, setBatches] = useState<Batch[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    
    // Appoint Rep states
    const [searchQuery, setSearchQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [repLoading, setRepLoading] = useState(false);
    const [repMessage, setRepMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Create Batch states
    const [batchName, setBatchName] = useState("");
    const [intakeYear, setIntakeYear] = useState("");
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchMessage, setBatchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Create Course states
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [courseYear, setCourseYear] = useState(1);
    const [courseSem, setCourseSem] = useState(1);
    const [courseBatchId, setCourseBatchId] = useState("");
    const [courseLoading, setCourseLoading] = useState(false);
    const [courseMessage, setCourseMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fetch initial config data
    const refreshData = () => {
        batchService.getAll().then((res) => {
            setBatches(res.data);
            if (res.data.length > 0) {
                setCourseBatchId(res.data[0].id.toString());
            }
        });
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Fetch courses when tab or batch selection changes
    useEffect(() => {
        if (batches.length > 0) {
            // Load courses from first batch initially
            courseService.getByBatch(batches[0].id).then((res) => {
                setCourses(res.data);
                if (res.data.length > 0) {
                    setSelectedCourseId(res.data[0].id.toString());
                }
            });
        }
    }, [batches]);

    // Handle user search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        userService.search(searchQuery).then((res) => {
            setFoundUsers(res.data);
            setSelectedUser(null); // Reset selection
        });
    };

    // Assign Representative Action
    const handleAssignRep = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !selectedCourseId) return;
        setRepLoading(true);
        setRepMessage(null);
        try {
            await courseService.assignModerator(selectedCourseId, selectedUser.id);
            setRepMessage({ type: "success", text: `Successfully appointed ${selectedUser.name} as representative/moderator!` });
            setSelectedUser(null);
            setSearchQuery("");
            setFoundUsers([]);
        } catch (err: any) {
            setRepMessage({ type: "error", text: err.response?.data?.message || "Failed to assign representative." });
        } finally {
            setRepLoading(false);
        }
    };

    // Create Batch Action
    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchName.trim() || !intakeYear) return;
        setBatchLoading(true);
        setBatchMessage(null);
        try {
            await batchService.create({ name: batchName, intakeYear: parseInt(intakeYear) });
            setBatchMessage({ type: "success", text: `Successfully created batch: ${batchName}` });
            setBatchName("");
            setIntakeYear("");
            refreshData();
        } catch (err: any) {
            setBatchMessage({ type: "error", text: err.response?.data?.message || "Failed to create batch." });
        } finally {
            setBatchLoading(false);
        }
    };

    // Create Course Action
    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseCode.trim() || !courseName.trim() || !courseBatchId) return;
        setCourseLoading(true);
        setCourseMessage(null);
        try {
            await courseService.create({
                code: courseCode,
                name: courseName,
                academicYear: courseYear,
                semesterNumber: courseSem,
                batchId: parseInt(courseBatchId),
            });
            setCourseMessage({ type: "success", text: `Successfully created course: ${courseCode} - ${courseName}` });
            setCourseCode("");
            setCourseName("");
            // Refresh courses list
            courseService.getByBatch(courseBatchId).then((res) => setCourses(res.data));
        } catch (err: any) {
            setCourseMessage({ type: "error", text: err.response?.data?.message || "Failed to create course." });
        } finally {
            setCourseLoading(false);
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
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CONTENT WORKSPACE ── */}
                <div style={{ flex: 1 }}>
                    {/* Appoint representative tab */}
                    {activeTab === "rep" && (
                        <div className="fade-in" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>Appoint Course Representative</h2>
                            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                                Find a student and assign them as a representative to moderate a specific course.
                            </p>

                            {/* User Search form */}
                            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                                <div style={{ flex: 1, position: "relative" }}>
                                    <input
                                        type="text"
                                        placeholder="Search user by name or email..."
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

                            {/* User Search Results */}
                            {foundUsers.length > 0 && (
                                <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden", marginBottom: 24, maxHeight: 200, overflowY: "auto" }}>
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
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#0D1B2A" }}>{u.name}</div>
                                                <div style={{ fontSize: 12, color: "#6B7280" }}>{u.email}</div>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", background: u.role === "ADMIN" ? "#FEF2F2" : u.role === "MODULE_REP" ? "#FEF3C7" : "#EFF6FF", color: u.role === "ADMIN" ? "#991B1B" : u.role === "MODULE_REP" ? "#92400E" : "#1E40AF", borderRadius: 4 }}>
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Representative Assignment selection */}
                            {selectedUser && (
                                <form onSubmit={handleAssignRep} style={{ borderTop: "1px solid #F3F4F6", paddingTop: 20 }}>
                                    <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 700 }}>Appointing Rep</div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: "#0D1B2A", marginTop: 2 }}>{selectedUser.name}</div>
                                            <div style={{ fontSize: 12, color: "#6B7280" }}>{selectedUser.email}</div>
                                        </div>
                                    </div>

                                    {/* Select Course */}
                                    <div style={{ marginBottom: 24 }}>
                                        <label style={labelStyle}>Assign to Course</label>
                                        <select
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            style={selectStyle}
                                        >
                                            {batches.map((b) => (
                                                <optgroup key={b.id} label={`${b.name} (Intake ${b.intakeYear})`}>
                                                    {courses
                                                        .filter((c) => c.batchName === b.name)
                                                        .map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.code} - {c.name}
                                                            </option>
                                                        ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <button type="submit" className="btn-primary" disabled={repLoading} style={{ padding: "12px 28px" }}>
                                        {repLoading ? "Assigning..." : "Assign as Course Rep"}
                                    </button>
                                </form>
                            )}

                            {repMessage && (
                                <div style={{
                                    marginTop: 20,
                                    background: repMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                                    border: `1px solid ${repMessage.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                                    color: repMessage.type === "success" ? "#065F46" : "#991B1B",
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                }}>
                                    {repMessage.text}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Batch Tab */}
                    {activeTab === "batch" && (
                        <div className="fade-in" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>Create Academic Batch</h2>
                            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                                Add a new intake batch to group academic materials (e.g. 21st Batch, 22nd Batch).
                            </p>

                            <form onSubmit={handleCreateBatch} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div>
                                    <label style={labelStyle}>Batch Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 21st Batch"
                                        value={batchName}
                                        onChange={(e) => setBatchName(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Intake Year</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 2021"
                                        value={intakeYear}
                                        onChange={(e) => setIntakeYear(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={batchLoading} style={{ padding: "12px 28px", alignSelf: "flex-start" }}>
                                    {batchLoading ? "Creating..." : "Create Batch"}
                                </button>
                            </form>

                            {batchMessage && (
                                <div style={{
                                    marginTop: 20,
                                    background: batchMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                                    border: `1px solid ${batchMessage.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                                    color: batchMessage.type === "success" ? "#065F46" : "#991B1B",
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                }}>
                                    {batchMessage.text}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Course Tab */}
                    {activeTab === "course" && (
                        <div className="fade-in" style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: 28 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0D1B2A", marginBottom: 6 }}>Create New Course Module</h2>
                            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
                                Add a specific module code and title scoped to an intake, year and semester.
                            </p>

                            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Course Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. IT3200"
                                            value={courseCode}
                                            onChange={(e) => setCourseCode(e.target.value)}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Course Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Database Systems"
                                            value={courseName}
                                            onChange={(e) => setCourseName(e.target.value)}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Academic Year</label>
                                        <select
                                            value={courseYear}
                                            onChange={(e) => setCourseYear(parseInt(e.target.value))}
                                            style={selectStyle}
                                        >
                                            <option value={1}>Year 1</option>
                                            <option value={2}>Year 2</option>
                                            <option value={3}>Year 3</option>
                                            <option value={4}>Year 4</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Semester</label>
                                        <select
                                            value={courseSem}
                                            onChange={(e) => setCourseSem(parseInt(e.target.value))}
                                            style={selectStyle}
                                        >
                                            <option value={1}>Semester 1</option>
                                            <option value={2}>Semester 2</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Scoped to Batch</label>
                                    <select
                                        value={courseBatchId}
                                        onChange={(e) => setCourseBatchId(e.target.value)}
                                        style={selectStyle}
                                    >
                                        {batches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} (Intake {b.intakeYear})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="btn-primary" disabled={courseLoading} style={{ padding: "12px 28px", alignSelf: "flex-start" }}>
                                    {courseLoading ? "Creating..." : "Create Course"}
                                </button>
                            </form>

                            {courseMessage && (
                                <div style={{
                                    marginTop: 20,
                                    background: courseMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                                    border: `1px solid ${courseMessage.type === "success" ? "#A7F3D0" : "#FCA5A5"}`,
                                    color: courseMessage.type === "success" ? "#065F46" : "#991B1B",
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                }}>
                                    {courseMessage.text}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPanelPage;
