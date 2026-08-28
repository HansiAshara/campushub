import { useLocation } from "react-router-dom";

function getPageTitle(pathname: string): string {
    if (pathname === "/dashboard/batches") return "Batches";
    if (pathname === "/dashboard/my-uploads") return "My Uploads";
    if (pathname.endsWith("/upload")) return "Upload Resource";
    if (/^\/dashboard\/batches\/\d+$/.test(pathname)) return "Courses";
    if (/^\/dashboard\/courses\/\d+$/.test(pathname)) return "Course Detail";
    return "CampusHub";
}

function Header() {
    const location = useLocation();
    const title = getPageTitle(location.pathname);
    const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    return (
        <header style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", backgroundColor: "#fff", borderBottom: "1px solid var(--color-border)" }}>
            <h2 style={{ fontSize: 20 }}>{title}</h2>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)", padding: "6px 12px", borderRadius: 20, border: "1px solid var(--color-border)" }}>
                📅 {today}
            </span>
        </header>
    );
}

export default Header;