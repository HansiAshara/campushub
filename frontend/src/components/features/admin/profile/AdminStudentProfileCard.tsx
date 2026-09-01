import { useState, useEffect } from "react";
import { type Batch } from "../../../../types";
import { userService, type UserResponse } from "../../../../api/userService";
import { GraduationCap, CheckCircle2, User, Sparkles } from "lucide-react";

interface AdminStudentProfileCardProps {
    batches: Batch[];
    onProfileUpdated?: () => void;
}

const font = '"DM Sans", system-ui, sans-serif';

export default function AdminStudentProfileCard({ batches, onProfileUpdated }: AdminStudentProfileCardProps) {
    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [indexNo, setIndexNo] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [academicYear, setAcademicYear] = useState<number>(1);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const loadProfile = async () => {
        setLoadingProfile(true);
        try {
            const res = await userService.getMyProfile();
            const data = res.data;
            setProfile(data);
            if (data.indexNo) setIndexNo(data.indexNo);
            if (data.batchId) setSelectedBatchId(data.batchId.toString());
            if (data.academicYear) setAcademicYear(data.academicYear);
            else setAcademicYear(1);
        } catch (err) {
            console.error("Failed to load user profile", err);
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (batches.length > 0 && !selectedBatchId) {
            setSelectedBatchId(batches[0].id.toString());
        }
    }, [batches, selectedBatchId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBatchId) {
            setMessage({ type: "error", text: "Please select an academic batch." });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const res = await userService.updateAdminProfile({
                batchId: parseInt(selectedBatchId),
                academicYear,
                indexNo: indexNo.trim() || undefined,
            });
            const updated = res.data;
            setProfile(updated);

            // Sync with local session
            if (updated.batchId) localStorage.setItem("batchId", updated.batchId.toString());
            if (updated.batchName) localStorage.setItem("batchName", updated.batchName);
            if (updated.academicYear) localStorage.setItem("academicYear", updated.academicYear.toString());
            if (updated.indexNo) localStorage.setItem("indexNo", updated.indexNo);

            setMessage({
                type: "success",
                text: `Successfully linked your student identity to ${updated.batchName} (Year ${updated.academicYear})!`,
            });

            if (onProfileUpdated) onProfileUpdated();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to update admin student profile.",
            });
        } finally {
            setSaving(false);
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
        color: "#6B7280",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: 6,
    };

    return (
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 28, fontFamily: font }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#ECFDF5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0D1B2A", margin: 0 }}>
                            Admin Student Identity &amp; Batch Enrollment
                        </h3>
                        <p style={{ fontSize: 13, color: "#6B7280", margin: "2px 0 0" }}>
                            Link your administrator account to your student batch and index number to access batch courses and contribute resources.
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Status Box */}
            <div
                style={{
                    background: profile?.batchName ? "#F0FDF4" : "#FFFBEB",
                    border: `1px solid ${profile?.batchName ? "#BBF7D0" : "#FDE68A"}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    margin: "20px 0 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: profile?.batchName ? "#047857" : "#B45309" }}>
                        {profile?.batchName ? "Active Student Enrollment" : "Status: Not Enrolled In A Student Batch"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0D1B2A", marginTop: 3 }}>
                        {loadingProfile ? (
                            "Loading profile..."
                        ) : profile?.batchName ? (
                            <span>{profile.batchName} · Year {profile.academicYear} {profile.indexNo ? `· Index: ${profile.indexNo}` : ""}</span>
                        ) : (
                            "No student batch linked yet"
                        )}
                    </div>
                    <div style={{ fontSize: 12, color: profile?.batchName ? "#065F46" : "#78350F", marginTop: 2 }}>
                        {profile?.batchName
                            ? "Your account has access to your batch hub on the Batches page and full contributor capabilities."
                            : "Select your batch below to activate your enrolled batch hub on the Batches page."}
                    </div>
                </div>

                {profile?.batchName && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#DCFCE7", padding: "6px 12px", borderRadius: 8, color: "#15803D", fontSize: 12, fontWeight: 700 }}>
                        <Sparkles size={14} />
                        Enrolled
                    </div>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Index Number */}
                    <div>
                        <label style={labelStyle}>Your Student Index Number</label>
                        <input
                            type="text"
                            placeholder="e.g. 210015B"
                            value={indexNo}
                            onChange={(e) => setIndexNo(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label style={labelStyle}>Current Academic Year</label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                            style={{ ...inputStyle, cursor: "pointer" }}
                        >
                            <option value={1}>Year 1</option>
                            <option value={2}>Year 2</option>
                            <option value={3}>Year 3</option>
                            <option value={4}>Year 4</option>
                        </select>
                    </div>
                </div>

                {/* Academic Batch */}
                <div>
                    <label style={labelStyle}>Select Your Academic Batch</label>
                    <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        required
                        style={{ ...inputStyle, cursor: "pointer" }}
                    >
                        {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name} (Intake {b.intakeYear})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                    style={{ padding: "10px 24px", alignSelf: "flex-start", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                >
                    <User size={15} />
                    {saving ? "Saving..." : profile?.batchName ? "Update Student Profile" : "Enroll & Link Batch"}
                </button>
            </form>

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
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {message.type === "success" && <CheckCircle2 size={16} color="#10B981" />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
