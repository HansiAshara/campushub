import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";

export function useAuth() {
    const navigate = useNavigate();

    const persistSession = (token: string, name: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userName", name);
    };

    const login = async (email: string, password: string) => {
        const res = await authService.login(email, password);
        persistSession(res.data.token, res.data.name);
        navigate("/dashboard/batches");
    };

    const signup = async (name: string, email: string, password: string) => {
        const res = await authService.register(name, email, password);
        persistSession(res.data.token, res.data.name);
        navigate("/dashboard/batches");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/auth/login");
    };

    const isAuthenticated = () => !!localStorage.getItem("token");

    return { login, signup, logout, isAuthenticated };
}