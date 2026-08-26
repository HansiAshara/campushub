import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Sidebar() {
    const { logout } = useAuth();
    const userName = localStorage.getItem("userName") || "Hansi Ashara";
    const userEmail = localStorage.getItem("userEmail") || "hansi@gmail.com";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const menuItems = [
        {
            to: "/dashboard/courses",
            label: "Courses",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
            ),
        },
    ];

    return (
        <aside
            style={{
                width: 250,
                height: "100vh",
                backgroundColor: "#064E3B",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 50,
                color: "#A7F3D0",
                flexShrink: 0,
            }}
        >
            <div>
                {/* Brand Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 8px 32px" }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: "#10B981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            fontSize: 18,
                            fontWeight: 700,
                        }}
                    >
                        📚
                    </div>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                            CampusHub
                        </div>
                        <div style={{ fontSize: 11, color: "#A7F3D0", marginTop: 2 }}>
                            Academic Portal
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#6EE7B7", padding: "0 12px 10px", textTransform: "uppercase" }}>
                    MENU
                </div>

                {/* Nav Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                padding: "10px 14px",
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 500,
                                color: isActive ? "#FFFFFF" : "#D1FAE5",
                                backgroundColor: isActive ? "#047857" : "transparent",
                                transition: "all 0.15s ease",
                                textDecoration: "none",
                            })}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ display: "flex", alignItems: "center", opacity: 0.9 }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                            <div
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor: "#34D399",
                                }}
                            />
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Profile & Footer */}
            <div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px",
                        borderRadius: 12,
                        backgroundColor: "#047857",
                        marginBottom: 10,
                    }}
                >
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: "#10B981",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {userInitials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userName}
                        </div>
                        <div style={{ fontSize: 11, color: "#D1FAE5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userEmail}
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: "#D1FAE5",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        borderRadius: 8,
                        transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#FFFFFF";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#D1FAE5";
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;