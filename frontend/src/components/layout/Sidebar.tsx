import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Sidebar() {
    const { logout } = useAuth();
    const userName = localStorage.getItem("userName") || "Student";

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: "block", padding: "10px 14px", borderRadius: 8, marginBottom: 4,
        fontSize: 14, fontWeight: 500,
        color: isActive ? "var(--color-primary-dark)" : "#D1FAE5",
        backgroundColor: isActive ? "#fff" : "transparent",
    });

    return (
        <aside style={{ width: 240, minHeight: "100vh", backgroundColor: "#064E3B", padding: "24px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "sticky", top: 0 }}>
            <div>
                <div style={{ padding: "0 14px 28px" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#fff" }}>📚 CampusHub</span>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", color: "var(--color-secondary)", marginTop: 2 }}>
                        ACADEMIC PORTAL
                    </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6EE7B7", padding: "0 14px 8px" }}>MENU</div>
                <NavLink to="/dashboard/batches" style={linkStyle}>Batches</NavLink>
                <NavLink to="/dashboard/my-uploads" style={linkStyle}>My Uploads</NavLink>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 16 }}>
                <div style={{ padding: "0 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                        {userName[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{userName}</span>
                </div>
                <button onClick={logout} style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", color: "#D1FAE5", fontSize: 14, cursor: "pointer", borderRadius: 8 }}>
                    Sign out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;