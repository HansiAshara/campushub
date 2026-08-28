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
            <div style={{ flex: 1, backgroundColor: "#064E3B", color: "#fff", padding: 60, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>📚 CampusHub</div>
                <div>
                    <h1 style={{ color: "#fff", fontSize: 32, lineHeight: 1.3, maxWidth: 420 }}>The ACA folder, finally organized.</h1>
                    <p style={{ color: "#D1FAE5", fontSize: 15, maxWidth: 380, marginTop: 16 }}>Kuppi notes, tutes, and past papers — sorted by batch, semester, and course.</p>
                </div>
                <div style={{ fontSize: 12, color: "#6EE7B7" }}>Built by IT students, for IT students.</div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
                <div style={{ width: 360 }}>
                    <h2 style={{ fontSize: 26, marginBottom: 6 }}>Welcome back</h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 28 }}>Log in to browse your batch's resources.</p>
                    <form onSubmit={handleSubmit}>
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                        <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? "Logging in..." : "Log In"}</Button>
                    </form>
                    <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
                        New here? <Link to="/auth/signup" style={{ fontWeight: 600 }}>Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;