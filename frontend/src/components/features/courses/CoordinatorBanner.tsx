import { Shield, Edit, Trash2, User } from "lucide-react";

interface CoordinatorBannerProps {
    courseCode: string;
    courseName: string;
    userIndexNo?: string;
    userName?: string;
}

const font = '"DM Sans", system-ui, sans-serif';

const permissions = [
    { icon: Shield, label: "Manage Resources" },
    { icon: Edit, label: "Edit Resources" },
    { icon: Trash2, label: "Delete Resources" },
];

/**
 * Shown to the MODULE_COORDINATOR at the top of their coordinated course page.
 * Styled in indigo to be visually distinct from the green Batch Leader banner.
 */
export function CoordinatorOwnBanner({ courseCode, courseName, userIndexNo, userName }: CoordinatorBannerProps) {
    return (
        <div
            style={{
                background: "linear-gradient(135deg, #064E3B 0%, #065F46 60%, #047857 100%)",
                borderRadius: 16,
                padding: "20px 28px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
                boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.25)",
                marginBottom: 24,
                fontFamily: font,
            }}
        >
            {/* Left: Identity */}
            <div>
                <div style={{ marginBottom: 5 }}>
                    <span
                        style={{
                            background: "rgba(255,255,255,0.18)",
                            backdropFilter: "blur(4px)",
                            padding: "2px 10px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                        }}
                    >
                        Module Coordinator
                    </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 3px 0", letterSpacing: "-0.02em" }}>
                    {courseCode} — {courseName}
                </h2>
                <p style={{ fontSize: 12, color: "#A7F3D0", margin: 0, fontWeight: 500 }}>
                    Your coordinated module
                    {userName && (
                        <> · <strong style={{ color: "#D1FAE5" }}>{userName}{userIndexNo ? ` (${userIndexNo})` : ""}</strong></>
                    )}
                </p>
            </div>

            {/* Right: Permission chips */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {permissions.map(({ icon: Icon, label }) => (
                    <div
                        key={label}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.22)",
                            borderRadius: 20,
                            padding: "6px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "white",
                            backdropFilter: "blur(4px)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Icon size={13} style={{ flexShrink: 0 }} />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface StudentCoordinatorInfoProps {
    moderatorName: string;
    moderatorIndexNo?: string | null;
}

/**
 * Shown to regular students at the top of a course page so they know
 * who to contact about the module.
 */
export function StudentCoordinatorInfo({ moderatorName, moderatorIndexNo }: StudentCoordinatorInfoProps) {
    const initials = moderatorName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderLeft: "4px solid #059669",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 24,
                fontFamily: font,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Avatar */}
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #064E3B, #059669)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 800,
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#065F46", textTransform: "uppercase", marginBottom: 1 }}>
                        Module Coordinator
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#064E3B" }}>
                        {moderatorName}
                        {moderatorIndexNo && (
                            <span style={{ fontWeight: 500, color: "#059669", marginLeft: 6 }}>
                                ({moderatorIndexNo})
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
                        Contact for module queries &amp; resource concerns
                    </div>
                </div>
            </div>
            <User size={20} color="#6EE7B7" style={{ flexShrink: 0 }} />
        </div>
    );
}
