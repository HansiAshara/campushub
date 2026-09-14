import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Library, LogOut, ChevronDown, GraduationCap, ShieldCheck, Users } from "lucide-react";

/* ── Role labels shown in the avatar dropdown ── */
const ROLE_LABELS: Record<string, { label: string; Icon: typeof ShieldCheck }> = {
    ADMIN: { label: "System Administrator", Icon: ShieldCheck },
    BATCH_LEADER: { label: "Batch Leader", Icon: Users },
    STUDENT: { label: "Student", Icon: GraduationCap },
};

/* ─────────────────────────────────────────────────────────────────
   Shared tab style
   active  → green filled pill
   enabled → plain, hoverable
   ghost   → muted, not clickable (no context yet)
───────────────────────────────────────────────────────────────── */
function tabStyle(active: boolean, ghost = false): React.CSSProperties {
    return {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 13px",
        borderRadius: 7,
        fontSize: 13.5,
        fontWeight: 600,
        border: "none",
        cursor: ghost ? "default" : "pointer",
        textDecoration: "none",
        transition: "all 0.14s ease",
        background: active ? "#10B981" : "transparent",
        color: active ? "#ffffff" : ghost ? "#C0C8D4" : "#4B5563",
        boxShadow: active ? "0 2px 8px rgba(16,185,129,0.22)" : "none",
        whiteSpace: "nowrap",
        userSelect: "none",
        pointerEvents: ghost ? "none" : "auto",
    };
}

function TopNav() {
    const { logout } = useAuth();
    const location = useLocation();

    const [open, setOpen] = useState(false);
    const [lastBatchId, setLastBatchId] = useState<string>(
        () => localStorage.getItem("lastBatchId") || ""
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userName = localStorage.getItem("userName") || "Student";
    const role = localStorage.getItem("role") || "STUDENT";

    const initials = userName
        .split(" ")
        .map((n) => n[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const { label: roleLabel, Icon: RoleIcon } = ROLE_LABELS[role] ?? ROLE_LABELS.STUDENT;

    /* ── Derive navigation context from the current URL ── */
    const path = location.pathname;

    // e.g. /dashboard/batches/4  or /dashboard/batches/4/...
    const batchIdInUrl = path.match(/^\/dashboard\/batches\/(\d+)/)?.[1] ?? null;
    // e.g. /dashboard/courses/5  or /dashboard/courses/5/...
    const onCoursePage = /^\/dashboard\/courses\/\d+/.test(path);
    const onBatchList = path === "/dashboard/batches";
    const onCourseList = !!batchIdInUrl && !onCoursePage; // /dashboard/batches/:id

    /* Remember the last visited batch so "Courses" tab survives on resource pages */
    useEffect(() => {
        if (batchIdInUrl && batchIdInUrl !== lastBatchId) {
            localStorage.setItem("lastBatchId", batchIdInUrl);
            setLastBatchId(batchIdInUrl);
        }
    }, [batchIdInUrl, lastBatchId]);

    /* Close avatar dropdown when clicking outside or on route change */
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    useEffect(() => { setOpen(false); }, [path]);

    /* Courses tab destination */
    const coursesLink = lastBatchId ? `/dashboard/batches/${lastBatchId}` : null;

    return (
        <header style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(255,255,255,0.93)",
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
                gap: 6,
            }}>

                {/* ── Logo ── */}
                <Link
                    to="/dashboard/batches"
                    style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0, marginRight: 20 }}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(16,185,129,0.28)",
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

                {/* ── Navigation ── */}
                <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>

                    {/* ─── GROUP 1: Content hierarchy tabs ─── */}

                    {/* 1. Batches — always visible */}
                    <HoverTab
                        to="/dashboard/batches"
                        active={onBatchList}
                        ghost={false}
                        label="Batches"
                    />

                    {/* Arrow separator */}
                    <span style={{ color: "#D1D5DB", fontSize: 14, margin: "0 1px", userSelect: "none" }}>›</span>

                    {/* 2. Courses — enabled once a batch has been visited */}
                    {coursesLink ? (
                        <HoverTab
                            to={coursesLink}
                            active={onCourseList}
                            ghost={false}
                            label="Courses"
                        />
                    ) : (
                        <span style={tabStyle(false, true)}>Courses</span>
                    )}

                    {/* Arrow separator */}
                    <span style={{ color: "#D1D5DB", fontSize: 14, margin: "0 1px", userSelect: "none" }}>›</span>

                    {/* 3. Resources — active only when inside a course */}
                    <span style={tabStyle(onCoursePage, !onCoursePage)}>Resources</span>

                    {/* ─── Vertical divider ─── */}
                    <div style={{
                        width: 1, height: 20,
                        background: "#E5E7EB",
                        margin: "0 10px",
                        flexShrink: 0,
                    }} />

                    {/* ─── GROUP 2: Personal / management tabs ─── */}

                    {/* My Uploads — always visible */}
                    <NavLink
                        to="/dashboard/my-uploads"
                        style={({ isActive }) => tabStyle(isActive)}
                        onMouseOver={hoverOn}
                        onMouseOut={hoverOff}
                    >
                        My Uploads
                    </NavLink>

                    {/* Leader Panel — BATCH_LEADER only */}
                    {role === "BATCH_LEADER" && (
                        <NavLink
                            to="/dashboard/batch-leader"
                            style={({ isActive }) => tabStyle(isActive)}
                            onMouseOver={hoverOn}
                            onMouseOut={hoverOff}
                        >
                            Leader Panel
                        </NavLink>
                    )}

                    {/* Admin Panel — ADMIN only */}
                    {role === "ADMIN" && (
                        <NavLink
                            to="/dashboard/admin"
                            style={({ isActive }) => tabStyle(isActive)}
                            onMouseOver={hoverOn}
                            onMouseOut={hoverOff}
                        >
                            Admin Panel
                        </NavLink>
                    )}
                </nav>

                {/* ── Avatar / Dropdown ── */}
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
                            fontFamily: "var(--font-sans)",
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
                            flexShrink: 0, userSelect: "none",
                        }}>
                            {initials}
                        </div>

                        {/* First name */}
                        <span style={{
                            fontSize: 13, fontWeight: 600, color: "#0D1B2A",
                            maxWidth: 110, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                            {userName.split(" ")[0]}
                        </span>

                        <ChevronDown
                            size={14}
                            color="#9CA3AF"
                            style={{
                                transition: "transform 0.2s",
                                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            }}
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
                            {/* User info */}
                            <div style={{
                                padding: "14px 16px 12px",
                                borderBottom: "1px solid #F3F4F6",
                            }}>
                                <div style={{
                                    fontWeight: 700, fontSize: 14, color: "#0D1B2A",
                                    overflow: "hidden", textOverflow: "ellipsis",
                                    whiteSpace: "nowrap", marginBottom: 4,
                                }}>
                                    {userName}
                                </div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    fontSize: 12, color: "#6B7280", fontWeight: 500,
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
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "9px 10px", borderRadius: 8,
                                        border: "none", background: "transparent",
                                        color: "#DC2626", fontSize: 13, fontWeight: 600,
                                        cursor: "pointer", textAlign: "left",
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

/* ─── Reusable hoverable Link tab ─── */
function HoverTab({ to, active, ghost, label }: {
    to: string;
    active: boolean;
    ghost: boolean;
    label: string;
}) {
    const [hovered, setHovered] = useState(false);
    const style: React.CSSProperties = {
        ...tabStyle(active, ghost),
        ...(hovered && !active ? { background: "#F3F4F6", color: "#0D1B2A" } : {}),
    };
    return (
        <Link
            to={to}
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {label}
        </Link>
    );
}

/* ─── Hover helpers for NavLink tabs (which track isActive via className) ─── */
function hoverOn(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = e.currentTarget as HTMLElement;
    if (el.style.background !== "rgb(16, 185, 129)") {
        el.style.background = "#F3F4F6";
        el.style.color = "#0D1B2A";
    }
}
function hoverOff(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = e.currentTarget as HTMLElement;
    if (el.style.background !== "rgb(16, 185, 129)") {
        el.style.background = "transparent";
        el.style.color = "#4B5563";
    }
}

export default TopNav;
