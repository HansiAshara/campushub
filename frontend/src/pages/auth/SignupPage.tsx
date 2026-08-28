import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 8) { setError("Password needs at least 8 characters."); return; }
        setLoading(true);
        try {
            await signup(name, email, password);
        } catch (err: any) {
            setError(err.response?.data?.message || "That email is already registered.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <div style={{ flex: 1, backgroundColor: "#064E3B", color: "#fff", padding: 60, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>📚 CampusHub</div>
                <div>
                    <h1 style={{ color: "#fff", fontSize: 32, lineHeight: 1.3, maxWidth: 420 }}>Stop searching five different Drive links.</h1>
                    <p style={{ color: "#D1FAE5", fontSize: 15, maxWidth: 380, marginTop: 16 }}>One account, every batch, every course you're taking.</p>
                </div>
                <div style={{ fontSize: 12, color: "#6EE7B7" }}>Free for all current students.</div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
                <div style={{ width: 360 }}>
                    <h2 style={{ fontSize: 26, marginBottom: 6 }}>Create your account</h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 28 }}>Takes less than a minute.</p>
                    <form onSubmit={handleSubmit}>
                        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                        <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? "Creating account..." : "Sign Up"}</Button>
                    </form>
                    <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-text-muted)" }}>
                        Already have an account? <Link to="/auth/login" style={{ fontWeight: 600 }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;