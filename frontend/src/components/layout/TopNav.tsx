import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Upload, Search, Library } from "lucide-react";

function TopNav() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "Student";
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const role = localStorage.getItem("role") || "STUDENT";

    return (
        <header className="top-nav">
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 32 }}>
                {/* Logo */}
                <Link to="/dashboard/batches" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "#10B981",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Library size={18} color="white" />
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#0D1B2A", letterSpacing: "-0.02em" }}>
                        CampusHub
                    </span>
                </Link>

                {/* Nav Links */}
                <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <NavLink
                        to="/dashboard/batches"
                        className={({ isActive }) => isActive ? "nav-tab active" : "nav-tab"}
                        style={({ isActive }) => ({
                            padding: "6px 16px",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            transition: "all 0.12s",
                            background: isActive ? "#10B981" : "transparent",
                            color: isActive ? "white" : "#374151",
                        })}
                    >
                        Browse
                    </NavLink>
                    <NavLink
                        to="/dashboard/my-uploads"
                        className={({ isActive }) => isActive ? "nav-tab active" : "nav-tab"}
                        style={({ isActive }) => ({
                            padding: "6px 16px",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            transition: "all 0.12s",
                            background: "transparent",
                            color: isActive ? "#10B981" : "#374151",
                        })}
                    >
                        My Uploads
                    </NavLink>
                    {(role === "ADMIN" || role === "BATCH_LEADER") && (
                        <NavLink
                            to="/dashboard/admin"
                            className={({ isActive }) => isActive ? "nav-tab active" : "nav-tab"}
                            style={({ isActive }) => ({
                                padding: "6px 16px",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                transition: "all 0.12s",
                                background: "transparent",
                                color: isActive ? "#10B981" : "#374151",
                            })}
                        >
                            Admin Panel
                        </NavLink>
                    )}
                </nav>

                {/* Search Bar - grows */}
                <div style={{ flex: 1, maxWidth: 380 }}>
                    <div
                        onClick={() => navigate("/dashboard/batches")}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 14px",
                            background: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            borderRadius: 8,
                            cursor: "text",
                        }}
                    >
                        <Search size={15} color="#9CA3AF" />
                        <span style={{ fontSize: 13, color: "#9CA3AF" }}>Search notes, papers, topics...</span>
                    </div>
                </div>

                {/* Right actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
                    <button
                        onClick={logout}
                        className="btn-primary"
                        style={{ padding: "7px 16px", fontSize: 13 }}
                    >
                        <Upload size={14} />
                        Upload
                    </button>

                    {/* Avatar */}
                    <div
                        onClick={logout}
                        style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "linear-gradient(135deg, #10B981, #047857)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 700, fontSize: 13,
                            cursor: "pointer",
                            flexShrink: 0,
                            userSelect: "none",
                        }}
                        title={`${userName} — Click to sign out`}
                    >
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TopNav;
