import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

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
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <div
                style={{
                    flex: 1,
                    backgroundColor: "var(--color-ink)",
                    color: "#fff",
                    padding: 60,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>CampusHub</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--color-chalk)", marginTop: 4 }}>
                        UNIVERSITY OF MORATUWA
                    </div>
                </div>
                <div>
                    <h1 style={{ color: "#fff", fontSize: 34, lineHeight: 1.3, maxWidth: 420 }}>
                        The ACA folder, finally organized.
                    </h1>
                    <p style={{ color: "#B9C4BF", fontSize: 15, maxWidth: 380, marginTop: 16 }}>
                        Kuppi notes, tutes, and past papers — sorted by course, searchable, and never duplicated.
                    </p>
                </div>
                <div style={{ fontSize: 12, color: "#7C8B86" }}>Built by IT students, for IT students.</div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-paper)" }}>
                <div style={{ width: 360 }}>
                    <h2 style={{ fontSize: 26, marginBottom: 6 }}>Welcome back</h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 28 }}>Log in to browse your courses.</p>

                    <form onSubmit={handleSubmit}>
                        <Input label="Email" type="email" placeholder="you@uom.lk" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                        <Button type="submit" variant="chalk" fullWidth disabled={loading}>
                            {loading ? "Logging in..." : "Log In"}
                        </Button>
                    </form>

                    <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
                        New to CampusHub? <Link to="/auth/signup" style={{ color: "var(--color-ink)", fontWeight: 600 }}>Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;