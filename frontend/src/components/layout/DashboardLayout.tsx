import { Navigate, Outlet } from "react-router-dom";
import TopNav from "./TopNav";

function AppLayout() {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/auth/login" />;

    return (
        <div style={{ minHeight: "100vh", background: "#F4FBF4" }}>
            <TopNav />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;