import { useLocation } from "react-router-dom";

function getPageTitle(pathname: string): string {
    if (pathname === "/dashboard/courses") return "Courses";
    if (pathname.endsWith("/upload")) return "Upload Resource";
    if (/^\/dashboard\/courses\/\d+$/.test(pathname)) return "Course Details";
    return "CampusHub";
}

function Topbar() {
    const location = useLocation();
    const title = getPageTitle(location.pathname);
    const userName = localStorage.getItem("userName") || "Student";
    const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 32px",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #E2E8F0",
            }}
        >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{title}</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#64748B",
                        padding: "6px 12px",
                        borderRadius: 20,
                        border: "1px solid #E2E8F0",
                    }}
                >
                    📅 {today}
                </span>

                <button
                    aria-label="Notifications"
                    style={{
                        position: "relative",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "1px solid #E2E8F0",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer",
                        fontSize: 15,
                    }}
                >
                    🔔
                    <span
                        style={{
                            position: "absolute",
                            top: 7,
                            right: 8,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: "#F59E0B",
                            border: "1.5px solid #fff",
                        }}
                    />
                </button>

                <div
                    title={userName}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "default",
                    }}
                >
                    {initials}
                </div>
            </div>
        </header>
    );
}

export default Topbar;