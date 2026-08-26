import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", response.data.token);
            navigate("/courses");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "80px auto" }}>
            <h2>Log in to CampusHub</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" style={{ padding: "8px 16px" }}>Log In</button>
            </form>
        </div>
    );
}

export default LoginPage;