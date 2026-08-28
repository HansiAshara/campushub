import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Library, Fingerprint, Sparkles, GitBranch } from "lucide-react";

const font = '"DM Sans", system-ui, sans-serif';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
        } catch {
            setError("That email and password don't match our records.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: font }}>
            {/* ── LEFT — Hero panel ── */}
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
                        Every tute, paper<br />
                        and kuppi{" "}
                        <span style={{ color: "#10B981" }}>— finally in order.</span>
                    </h1>
                    <p style={{ fontFamily: font, fontSize: 15, color: "#374151", maxWidth: 380, lineHeight: 1.65, fontWeight: 400 }}>
                        CampusHub replaces chaotic ACA Drive folders with a batch- and semester-scoped hub:
                        content-aware search, SHA-256 duplicate prevention, version threads and AI summaries on every upload.
                    </p>

                    {/* Feature list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
                        {[
                            { Icon: Fingerprint, title: "SHA-256 dedupe", desc: "Exact matches short-circuit on upload." },
                            { Icon: Sparkles, title: "AI summaries", desc: "2–3 sentence gist plus topic tags." },
                            { Icon: GitBranch, title: "Version threads", desc: "Revisions link, never fragment." },
                        ].map(({ Icon, title, desc }) => (
                            <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(16,185,129,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                    <Icon size={15} color="#10B981" />
                                </div>
                                <div>
                                    <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: "#0D1B2A" }}>{title}</div>
                                    <div style={{ fontFamily: font, fontSize: 13, color: "#6B7280", marginTop: 1 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontFamily: font, fontSize: 12, color: "#9CA3AF" }}>Built by IT students, for IT students.</p>
            </div>

            {/* ── RIGHT — Login Form ── */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "white", padding: "48px 56px" }}>
                <div style={{ width: "100%", maxWidth: 380 }}>
                    <h2 style={{ fontFamily: font, fontSize: 28, fontWeight: 800, color: "#0D1B2A", marginBottom: 8, letterSpacing: "-0.02em" }}>
                        Welcome back
                    </h2>
                    <p style={{ fontFamily: font, fontSize: 14, color: "#6B7280", marginBottom: 32, fontWeight: 400 }}>
                        Log in to browse your batch's resources.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontFamily: font, fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@uom.lk"
                                required
                                style={{ width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", background: "white" }}
                                onFocus={(e) => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: "block", fontFamily: font, fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: "100%", padding: "11px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, fontFamily: font, color: "#0D1B2A", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", background: "white" }}
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
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
                        <p style={{ fontFamily: font, fontSize: 14, color: "#6B7280", fontWeight: 400 }}>
                            New here?{" "}
                            <Link
                                to="/auth/signup"
                                style={{ color: "#10B981", fontWeight: 700, textDecoration: "none" }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;