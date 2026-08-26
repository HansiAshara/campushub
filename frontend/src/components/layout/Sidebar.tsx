import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Sidebar() {
    const { logout } = useAuth();
    const userName = localStorage.getItem("userName") || "Student";

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: "block",
        padding: "10px 14px",
        borderRadius: 6,
        marginBottom: 4,
        fontSize: 14,
        fontWeight: 500,
        color: isActive ? "var(--color-ink)" : "#D8E3DE",
        backgroundColor: isActive ? "var(--color-chalk)" : "transparent",
    });

    return (
        <aside
            style={{
                width: 240,
                minHeight: "100vh",
                backgroundColor: "var(--color-ink)",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
            }}
        >
            <div>
                <div style={{ padding: "0 14px 28px" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#fff" }}>
                        CampusHub
                    </span>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--color-chalk)", marginTop: 2 }}>
                        UNIVERSITY OF MORATUWA
                    </div>
                </div>

                <NavLink to="/dashboard/courses" style={linkStyle}>Courses</NavLink>
            </div>

            <div style={{ borderTop: "1px solid var(--color-ink-light)", paddingTop: 16 }}>
                <div style={{ padding: "0 14px 10px", fontSize: 13, color: "#D8E3DE" }}>
                    Signed in as <strong>{userName}</strong>
                </div>
                <button
                    onClick={logout}
                    style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background: "transparent",
                        border: "none",
                        color: "#D8E3DE",
                        fontSize: 14,
                        cursor: "pointer",
                        borderRadius: 6,
                    }}
                >
                    Log Out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;