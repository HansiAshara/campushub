import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Library, LogOut, ChevronDown, GraduationCap, ShieldCheck, Users } from "lucide-react";

/* ── Role labels shown in the avatar dropdown ── */
const ROLE_LABELS: Record<string, { label: string; Icon: typeof ShieldCheck }> = {
    ADMIN:        { label: "System Administrator", Icon: ShieldCheck },
    BATCH_LEADER: { label: "Batch Leader",          Icon: Users },
    STUDENT:      { label: "Student",               Icon: GraduationCap },
};

function TopNav() {
    const { logout } = useAuth();
    const location = useLocation();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userName = localStorage.getItem("userName") || "Student";
    const role     = localStorage.getItem("role")     || "STUDENT";

    const initials = userName
        .split(" ")
        .map((n) => n[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const { label: roleLabel, Icon: RoleIcon } = ROLE_LABELS[role] ?? ROLE_LABELS.STUDENT;

    /* Close dropdown when clicking outside */
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    /* Close dropdown on route change */
    useEffect(() => { setOpen(false); }, [location.pathname]);

    /* "Batches" tab should be active for the whole /batches and /courses sub-tree */
    const batchesActive =
        location.pathname.startsWith("/dashboard/batches") ||
        location.pathname.startsWith("/dashboard/courses");

    /* shared tab style builder */
    const tabStyle = (active: boolean): React.CSSProperties => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        textDecoration: "none",
        transition: "all 0.14s ease",
        background: active ? "#10B981" : "transparent",
        color:      active ? "#ffffff" : "#4B5563",
        boxShadow:  active ? "0 2px 8px rgba(16,185,129,0.22)" : "none",
        whiteSpace: "nowrap",
    });

    return (
        <header style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid #E5E7EB",
        }}>
            <div style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "0 24px",
                height: 60,
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}>

                {/* ── Logo ── */}
                <Link
                    to="/dashboard/batches"
                    style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginRight: 16 }}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(16,185,129,0.30)",
                    }}>
                        <Library size={17} color="white" />
                    </div>
                    <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 18,
                        color: "#0D1B2A",
                        letterSpacing: "-0.02em",
                    }}>
                        CampusHub
                    </span>
                </Link>

                {/* ── Nav tabs ── */}
                <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>

                    {/* Batches — always visible, active for /batches and /courses sub-tree */}
                    <Link
                        to="/dashboard/batches"
                        style={tabStyle(batchesActive)}
                        onMouseOver={(e) => {
                            if (!batchesActive) {
                                (e.currentTarget as HTMLElement).style.background = "#F3F4F6";
                                (e.currentTarget as HTMLElement).style.color = "#0D1B2A";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!batchesActive) {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "#4B5563";
                            }
                        }}
                    >
                        Batches
                    </Link>

                    {/* My Uploads — always visible */}
                    <NavLink
                        to="/dashboard/my-uploads"
                        style={({ isActive }) => tabStyle(isActive)}
                        onMouseOver={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            if (!el.classList.contains("active")) {
                                el.style.background = "#F3F4F6";
                                el.style.color = "#0D1B2A";
                            }
                        }}
                        onMouseOut={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            if (!el.classList.contains("active")) {
                                el.style.background = "transparent";
                                el.style.color = "#4B5563";
                            }
                        }}
                    >
                        My Uploads
                    </NavLink>

                    {/* Leader Panel — BATCH_LEADER only */}
                    {role === "BATCH_LEADER" && (
                        <NavLink
                            to="/dashboard/batch-leader"
                            style={({ isActive }) => tabStyle(isActive)}
                            onMouseOver={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                if (!el.classList.contains("active")) {
                                    el.style.background = "#F3F4F6";
                                    el.style.color = "#0D1B2A";
                                }
                            }}
                            onMouseOut={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                if (!el.classList.contains("active")) {
                                    el.style.background = "transparent";
                                    el.style.color = "#4B5563";
                                }
                            }}
                        >
                            Leader Panel
                        </NavLink>
                    )}

                    {/* Admin Panel — ADMIN only */}
                    {role === "ADMIN" && (
                        <NavLink
                            to="/dashboard/admin"
                            style={({ isActive }) => tabStyle(isActive)}
                            onMouseOver={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                if (!el.classList.contains("active")) {
                                    el.style.background = "#F3F4F6";
                                    el.style.color = "#0D1B2A";
                                }
                            }}
                            onMouseOut={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                if (!el.classList.contains("active")) {
                                    el.style.background = "transparent";
                                    el.style.color = "#4B5563";
                                }
                            }}
                        >
                            Admin Panel
                        </NavLink>
                    )}
                </nav>

                {/* ── Avatar Dropdown ── */}
                <div ref={dropdownRef} style={{ position: "relative", marginLeft: "auto" }}>
                    <button
                        onClick={() => setOpen(!open)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 10px 5px 5px",
                            borderRadius: 10,
                            border: "1px solid #E5E7EB",
                            background: open ? "#F9FAFB" : "white",
                            cursor: "pointer",
                            transition: "all 0.14s ease",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = "#D1D5DB")}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                        aria-expanded={open}
                        aria-haspopup="true"
                        title={`${userName} · ${roleLabel}`}
                    >
                        {/* Avatar circle */}
                        <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 700, fontSize: 12,
                            flexShrink: 0,
                            userSelect: "none",
                        }}>
                            {initials}
                        </div>

                        {/* Name truncated */}
                        <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0D1B2A",
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                            {userName.split(" ")[0]}
                        </span>

                        <ChevronDown
                            size={14}
                            color="#9CA3AF"
                            style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                    </button>

                    {/* Dropdown panel */}
                    {open && (
                        <div style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            minWidth: 220,
                            background: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: 12,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                            overflow: "hidden",
                            zIndex: 200,
                        }}>
                            {/* User info header */}
                            <div style={{
                                padding: "14px 16px 12px",
                                borderBottom: "1px solid #F3F4F6",
                            }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#0D1B2A",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    marginBottom: 4,
                                }}>
                                    {userName}
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: 12,
                                    color: "#6B7280",
                                    fontWeight: 500,
                                }}>
                                    <RoleIcon size={12} color="#10B981" />
                                    {roleLabel}
                                </div>
                            </div>

                            {/* Sign Out */}
                            <div style={{ padding: 6 }}>
                                <button
                                    onClick={logout}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "9px 10px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "transparent",
                                        color: "#DC2626",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.12s",
                                        fontFamily: "var(--font-sans)",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}

export default TopNav;
