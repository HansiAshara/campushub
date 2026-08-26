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

        if (password.length < 8) {
            setError("Password needs at least 8 characters.");
            return;
        }

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
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAF5" }}>
            <div
                style={{
                    flex: 1,
                    backgroundColor: "#064E3B",
                    color: "#FFFFFF",
                    padding: 60,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>CampusHub</div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#6EE7B7", marginTop: 4 }}>
                        UNIVERSITY OF MORATUWA
                    </div>
                </div>
                <div>
                    <h1 style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 700, lineHeight: 1.25, maxWidth: 440 }}>
                        Stop searching five different Drive links.
                    </h1>
                    <p style={{ color: "#D1FAE5", fontSize: 15, maxWidth: 400, marginTop: 16, lineHeight: 1.6 }}>
                        One account, every course, every kuppi note your batch has shared.
                    </p>
                </div>
                <div style={{ fontSize: 13, color: "#A7F3D0" }}>Free for all current students.</div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
                <div
                    style={{
                        width: "100%",
                        maxWidth: 400,
                        backgroundColor: "#FFFFFF",
                        padding: "40px 36px",
                        borderRadius: 16,
                        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.08)",
                        border: "1px solid #E2E8F0",
                    }}
                >
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Create your account</h2>
                    <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>Takes less than a minute.</p>

                    <form onSubmit={handleSubmit}>
                        <Input label="Full name" type="text" placeholder="Ashara Perera" value={name} onChange={(e) => setName(e.target.value)} required />
                        <Input label="Email" type="email" placeholder="you@uom.lk" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {error && <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                        <Button type="submit" variant="chalk" fullWidth disabled={loading}>
                            {loading ? "Creating account..." : "Sign Up"}
                        </Button>
                    </form>

                    <p style={{ marginTop: 24, fontSize: 14, color: "var(--color-text-muted)", textAlign: "center" }}>
                        Already have an account? <Link to="/auth/login" style={{ color: "var(--color-chalk)", fontWeight: 600 }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;