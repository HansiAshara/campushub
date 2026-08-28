import client from "./client";
import { type AuthResponse } from "../types";

export const authService = {
    login: (email: string, password: string) =>
        client.post<AuthResponse>("/auth/login", { email, password }),

    register: (name: string, email: string, password: string) =>
        client.post<AuthResponse>("/auth/register", { name, email, password }),
};