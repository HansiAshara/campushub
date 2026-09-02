import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";

export function useAuth() {
    const navigate = useNavigate();

    const persistSession = (token: string, name: string, role: string, batchId?: number | null, batchName?: string | null, userId?: number | null) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userName", name);
        localStorage.setItem("role", role);
        if (batchId) localStorage.setItem("batchId", batchId.toString());
        if (batchName) localStorage.setItem("batchName", batchName);
        if (userId) localStorage.setItem("userId", userId.toString());
    };

    const login = async (email: string, password: string) => {
        const res = await authService.login(email, password);
        persistSession(res.data.token, res.data.name, res.data.role, res.data.batchId, res.data.batchName, res.data.userId);
        navigate("/dashboard/batches");
    };

    const signup = async (name: string, email: string, password: string, indexNo?: string, batchId?: number, academicYear?: number) => {
        const res = await authService.register(name, email, password, indexNo, batchId, academicYear);
        persistSession(res.data.token, res.data.name, res.data.role, res.data.batchId, res.data.batchName, res.data.userId);
        navigate("/dashboard/batches");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");
        localStorage.removeItem("batchId");
        localStorage.removeItem("batchName");
        localStorage.removeItem("userId");
        navigate("/auth/login");
    };

    const isAuthenticated = () => !!localStorage.getItem("token");

    return { login, signup, logout, isAuthenticated };
}