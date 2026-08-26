import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout() {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/auth/login" />;

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flex: 1, padding: "36px 48px", minHeight: "100vh" }}>
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;