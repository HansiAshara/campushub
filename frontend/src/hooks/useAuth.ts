import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { type AuthResponse } from "../types";

export function useAuth() {
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        const response = await api.post<AuthResponse>("/auth/login", { email, password });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.name);
        navigate("/dashboard/courses");
    };

    const signup = async (name: string, email: string, password: string) => {
        const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.name);
        navigate("/dashboard/courses");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/auth/login");
    };

    return { login, signup, logout };
}