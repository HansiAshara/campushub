import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout() {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/auth/login" />;

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Header />
                <main style={{ flex: 1, padding: 32 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;