import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
    timeout: 10000,
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default client;