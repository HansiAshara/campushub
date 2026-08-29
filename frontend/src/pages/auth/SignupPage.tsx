import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { batchService } from "../../api/batchService";
import { type Batch } from "../../types";
import { Library } from "lucide-react";

const font = '"DM Sans", system-ui, sans-serif';

function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [indexNo, setIndexNo] = useState("");
    const [batchId, setBatchId] = useState<string>("");
    const [academicYear, setAcademicYear] = useState<number>(1);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    // Fetch batches for the dropdown select list
    useEffect(() => {
        batchService
            .getAll()
            .then((res) => {
                const data = res.data || [];
                setBatches(data);
                if (data.length > 0) {
                    setBatchId(data[0].id.toString());
                }
            })
            .catch((err) => {
                console.error("Failed to load batches:", err);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 8) { setError("Password needs at least 8 characters."); return; }
        setLoading(true);
        try {
            await signup(
                name,
                email,
                password,
                indexNo.trim() || undefined,
                batchId ? parseInt(batchId) : undefined,
                academicYear || undefined
            );
        } catch (err: any) {
            setError(err.response?.data?.message || "That email is already registered.");
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

    const labelStyle: React.CSSProperties = {
        display: "block", fontFamily: font, fontSize: 11, fontWeight: 700,
        color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7,
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: font }}>
            {/* ── LEFT — Hero Panel ── */}
            <div
                className="grid-bg"
                style={{ flex: 1, padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #c6f0d9" }}
            >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Library size={20} color="white" />
                    </div>
                    <span style={{ fontFamily: font, fontWeight: 800, fontSize: 19, color: "#0D1B2A", letterSpacing: "-0.01em" }}>
                        CampusHub
                    </span>
                </div>

                {/* Hero text */}
                <div>
                    <p style={{ fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#10B981", textTransform: "uppercase", marginBottom: 18 }}>
                        University of Moratuwa · IT
                    </p>
                    <h1 style={{ fontFamily: font, fontSize: 42, fontWeight: 800, color: "#0D1B2A", lineHeight: 1.1, marginBottom: 18, letterSpacing: "-0.02em" }}>
                        Stop searching five<br />
                        different{" "}
                        <span style={{ color: "#10B981" }}>Drive links.</span>
                    </h1>
                    <p style={{ fontFamily: font, fontSize: 15, color: "#374151", maxWidth: 380, lineHeight: 1.65, fontWeight: 400 }}>
                        One account, every batch and course you're taking — notes, tutes, past papers, all in one scoped hub.
                    </p>

                    <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 10 }}>
                        {["Batch-scoped resource browsing", "SHA-256 duplicate prevention", "AI-powered summaries on every upload"].map((feat) => (
                            <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
                                <span style={{ fontFamily: font, fontSize: 14, color: "#374151" }}>{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontFamily: font, fontSize: 12, color: "#9CA3AF" }}>Free for all current students.</p>
            </div>

            {/* ── RIGHT — Signup Form ── */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "white", padding: "48px 56px", overflowY: "auto" }}>
                <div style={{ width: "100%", maxWidth: 380, padding: "20px 0" }}>
                    <h2 style={{ fontFamily: font, fontSize: 28, fontWeight: 800, color: "#0D1B2A", marginBottom: 8, letterSpacing: "-0.02em" }}>
                        Create your account
                    </h2>
                    <p style={{ fontFamily: font, fontSize: 14, color: "#6B7280", marginBottom: 32, fontWeight: 400 }}>
                        Takes less than a minute.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        {/* Full name */}
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Sahan Wickramasinghe"
                                required
                                style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@uom.lk"
                                required
                                style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {/* Index Number */}
                        <div>
                            <label style={labelStyle}>Index Number</label>
                            <input
                                type="text"
                                value={indexNo}
                                onChange={(e) => setIndexNo(e.target.value)}
                                placeholder="e.g. 210015B"
                                required
                                style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {/* Batch selection */}
                        <div>
                            <label style={labelStyle}>Batch</label>
                            <select
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                required
                                style={{
                                    ...inputStyle,
                                    cursor: "pointer",
                                    appearance: "auto",
                                    WebkitAppearance: "menulist",
                                }}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            >
                                {batches.length === 0 ? (
                                    <option value="" disabled>
                                        No batches available
                                    </option>
                                ) : (
                                    batches.map((b) => (
                                        <option key={b.id} value={b.id} style={{ color: "#0D1B2A" }}>
                                            {b.name} (Intake {b.intakeYear})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Academic Year Selection */}
                        <div>
                            <label style={labelStyle}>Academic Year</label>
                            <select
                                value={academicYear}
                                onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                                required
                                style={{ ...inputStyle, cursor: "pointer" }}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            >
                                <option value={1}>Year 1</option>
                                <option value={2}>Year 2</option>
                                <option value={3}>Year 3</option>
                                <option value={4}>Year 4</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                required
                                style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "11px 14px", fontFamily: font, fontSize: 13, color: "#DC2626" }}>
                                {error}
                            </div>
                        )}

                        {/* ── SUBMIT BUTTON ── */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "13px 24px",
                                background: loading ? "#6EE7B7" : "#10B981",
                                color: "white",
                                border: "none",
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 700,
                                fontFamily: font,
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "background 0.15s, transform 0.1s",
                                letterSpacing: "-0.01em",
                                marginTop: 4,
                            }}
                            onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLElement).style.background = "#047857")}
                            onMouseLeave={(e) => !loading && ((e.currentTarget as HTMLElement).style.background = "#10B981")}
                            onMouseDown={(e) => !loading && ((e.currentTarget as HTMLElement).style.transform = "scale(0.98)")}
                            onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
                        <p style={{ fontFamily: font, fontSize: 14, color: "#6B7280", fontWeight: 400 }}>
                            Already have an account?{" "}
                            <Link
                                to="/auth/login"
                                style={{ color: "#10B981", fontWeight: 700, textDecoration: "none" }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;