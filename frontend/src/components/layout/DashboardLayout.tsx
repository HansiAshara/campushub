import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/auth/login" />;

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Topbar />
                <main style={{ flex: 1, padding: "36px 48px", minHeight: "100vh" }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;