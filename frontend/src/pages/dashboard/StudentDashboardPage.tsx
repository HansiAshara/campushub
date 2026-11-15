import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { batchService } from "../../api/batchService";
import { userService, type UserResponse } from "../../api/userService";
import { courseService } from "../../api/courseService";
import { resourceService } from "../../api/resourceService";
import { type Batch, type BatchStats, type Course, type Resource } from "../../types";
import { formatBatchSubtitle, getBatchAcademicYear } from "../../utils/batchUtils";
import {
    Search,
    X,
    Sparkles,
    BookOpen,
    FileText,
    UploadCloud,
    GraduationCap,
    ChevronRight,
    Info,
    Loader2,
} from "lucide-react";

export default function StudentDashboardPage() {
    const navigate = useNavigate();

    // Data states
    const [batches, setBatches] = useState<Batch[]>([]);
    const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
    const [stats, setStats] = useState<BatchStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [semanticLoading, setSemanticLoading] = useState(false);
    const [semanticResults, setSemanticResults] = useState<Resource[] | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Initial student data from storage / profile
    const storedBatchId = localStorage.getItem("batchId");
    const storedName = localStorage.getItem("userName") || "Student";

    // 1. Fetch user profile and all batches
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        Promise.all([
            batchService.getAll().catch(() => ({ data: [] })),
            userService.getMyProfile().catch(() => ({ data: null })),
        ])
            .then(([batchesRes, profileRes]) => {
                if (!isMounted) return;
                setBatches(batchesRes.data || []);
                if (profileRes.data) {
                    setUserProfile(profileRes.data);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Identify the authenticated student's batch
    const effectiveBatchId = userProfile?.batchId?.toString() || storedBatchId;
    const myBatch = batches.find((b) => effectiveBatchId && b.id.toString() === effectiveBatchId);

    // Academic Year & Semester
    const academicYear =
        userProfile?.academicYear ||
        (myBatch ? getBatchAcademicYear(myBatch) : 1);
    const currentSemester = (academicYear - 1) * 2 + 1;

    // 3. Fetch batch-specific statistics (KPIs) and courses for search
    useEffect(() => {
        if (!effectiveBatchId) {
            setStatsLoading(false);
            return;
        }

        let isMounted = true;
        setStatsLoading(true);

        Promise.all([
            batchService.getStats(effectiveBatchId).catch(() => null),
            courseService.getByBatch(effectiveBatchId).catch(() => ({ data: [] })),
        ])
            .then(([statsRes, coursesRes]) => {
                if (!isMounted) return;
                if (statsRes?.data) {
                    setStats(statsRes.data);
                }
                setCourses(coursesRes.data || []);
            })
            .finally(() => {
                if (isMounted) setStatsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [effectiveBatchId]);

    // 4. Keyboard shortcut Ctrl + K / Cmd + K to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
                setSearchOpen(true);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // 5. Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search filtering across courses
    const matchedCourses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return courses
            .filter(
                (c) =>
                    c.code?.toLowerCase().includes(q) ||
                    c.name?.toLowerCase().includes(q)
            )
            .slice(0, 5);
    }, [searchQuery, courses]);

    // Trigger AI semantic search using existing resource API
    const handleTriggerSemantic = async () => {
        if (!searchQuery.trim()) return;
        setSemanticLoading(true);
        try {
            const res = await resourceService.semanticSearch(undefined, searchQuery.trim(), 0.15);
            setSemanticResults(res.data || []);
            setSearchOpen(true);
        } catch (err) {
            console.error("Semantic search failed:", err);
            setSemanticResults([]);
        } finally {
            setSemanticLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSemanticResults(null);
        setSearchOpen(false);
    };

    // Calculate dynamic greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const studentName = (userProfile?.name || storedName).split(" ")[0] || "Student";
    const batchDisplayName = myBatch?.name || (effectiveBatchId ? `Batch ${effectiveBatchId}` : "Batch");

    // Other batches: all available batches EXCEPT the authenticated student's own batch
    const otherBatches = batches.filter((b) => {
        if (!effectiveBatchId) return true;
        return b.id.toString() !== effectiveBatchId.toString();
    });

    const hasSearchResults =
        matchedCourses.length > 0 || (semanticResults && semanticResults.length > 0);

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 32px 60px" }}>
            {/* ─────────────────────────────────────────────────────────────
                1. PERSONALIZED WELCOME SECTION
            ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #DCECE4",
                    borderRadius: 14,
                    padding: "24px 28px",
                    boxShadow: "0 1px 3px rgba(20, 43, 42, 0.04)",
                    marginBottom: 20,
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#08B981",
                        marginBottom: 6,
                    }}
                >
                    YOUR ACADEMIC WORKSPACE
                </div>

                <h1
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 26,
                        fontWeight: 800,
                        color: "#142B2A",
                        margin: 0,
                        lineHeight: 1.25,
                    }}
                >
                    {greeting}, {studentName} 👋
                </h1>

                <p
                    style={{
                        fontSize: 13.5,
                        color: "#71827B",
                        marginTop: 4,
                        marginBottom: 0,
                    }}
                >
                    {batchDisplayName} · Year {academicYear} · Semester {currentSemester}
                </p>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                2. ACADEMIC SEARCH BAR
            ───────────────────────────────────────────────────────────── */}
            <div ref={searchContainerRef} style={{ position: "relative", marginBottom: 28 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#FFFFFF",
                        border: `1.5px solid ${searchOpen ? "#08B981" : "#DCECE4"}`,
                        borderRadius: 12,
                        padding: "5px 10px 5px 16px",
                        boxShadow: searchOpen
                            ? "0 4px 16px rgba(8, 185, 129, 0.12)"
                            : "0 1px 3px rgba(20, 43, 42, 0.04)",
                        transition: "all 0.15s ease",
                    }}
                >
                    <Search size={18} color="#71827B" style={{ marginRight: 10, flexShrink: 0 }} />

                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSemanticResults(null);
                            setSearchOpen(true);
                        }}
                        onFocus={() => {
                            if (searchQuery.trim().length > 0) setSearchOpen(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && searchQuery.trim()) {
                                handleTriggerSemantic();
                            }
                        }}
                        placeholder="Search courses, notes, tutes, past papers..."
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: 14,
                            color: "#142B2A",
                            background: "transparent",
                            fontFamily: "var(--font-sans)",
                            padding: "8px 0",
                        }}
                    />

                    {/* Clear button */}
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                color: "#71827B",
                                display: "flex",
                                alignItems: "center",
                                marginRight: 6,
                            }}
                        >
                            <X size={15} />
                        </button>
                    )}

                    {/* Keyboard shortcut hint pill */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#F1FAF5",
                            border: "1px solid #DCECE4",
                            borderRadius: 6,
                            padding: "3px 7px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#71827B",
                            userSelect: "none",
                            marginRight: 8,
                        }}
                    >
                        <span>Ctrl</span>
                        <span>K</span>
                    </div>

                    {/* AI / Semantic Search trigger button */}
                    <button
                        type="button"
                        onClick={handleTriggerSemantic}
                        disabled={!searchQuery.trim() || semanticLoading}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 13px",
                            borderRadius: 8,
                            border: "none",
                            background: searchQuery.trim() ? "#08B981" : "#E5F6EE",
                            color: searchQuery.trim() ? "#FFFFFF" : "#71827B",
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: searchQuery.trim() ? "pointer" : "default",
                            transition: "all 0.15s ease",
                        }}
                        title="Search through document text and topic tags"
                    >
                        {semanticLoading ? (
                            <Loader2 size={13} className="spin-animation" />
                        ) : (
                            <Sparkles size={13} />
                        )}
                        <span>{semanticLoading ? "Searching..." : "Search"}</span>
                    </button>
                </div>

                {/* Search Results Dropdown */}
                {searchOpen && searchQuery.trim().length > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            left: 0,
                            right: 0,
                            background: "#FFFFFF",
                            border: "1px solid #DCECE4",
                            borderRadius: 12,
                            boxShadow: "0 10px 30px rgba(20, 43, 42, 0.10)",
                            zIndex: 100,
                            maxHeight: 400,
                            overflowY: "auto",
                            padding: "12px 14px",
                        }}
                    >
                        {hasSearchResults ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* Courses Results */}
                                {matchedCourses.length > 0 && (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color: "#71827B",
                                                marginBottom: 6,
                                            }}
                                        >
                                            Courses ({matchedCourses.length})
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {matchedCourses.map((c) => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSearchOpen(false);
                                                        navigate(`/dashboard/courses/${c.id}`);
                                                    }}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "8px 12px",
                                                        borderRadius: 8,
                                                        cursor: "pointer",
                                                        background: "#FAFFFD",
                                                        border: "1px solid #EBF5F0",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "#E5F6EE";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "#FAFFFD";
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                padding: "2px 7px",
                                                                borderRadius: 4,
                                                                background: "#08B981",
                                                                color: "white",
                                                            }}
                                                        >
                                                            {c.code}
                                                        </span>
                                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#142B2A" }}>
                                                            {c.name}
                                                        </span>
                                                        <span style={{ fontSize: 12, color: "#71827B" }}>
                                                            Year {c.academicYear} · Sem {c.semesterNumber}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={15} color="#71827B" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Semantic AI Results */}
                                {semanticResults && semanticResults.length > 0 && (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color: "#078E69",
                                                marginBottom: 6,
                                            }}
                                        >
                                            Resources ({semanticResults.length})
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {semanticResults.map((r) => (
                                                <div
                                                    key={r.id}
                                                    onClick={() => {
                                                        setSearchOpen(false);
                                                        const targetCourse = courses.find((c) =>
                                                            r.courseName?.includes(c.code) || r.courseName === c.name
                                                        );
                                                        if (targetCourse) {
                                                            navigate(`/dashboard/courses/${targetCourse.id}`);
                                                        } else if (r.fileUrl) {
                                                            window.open(r.fileUrl, "_blank", "noopener,noreferrer");
                                                        }
                                                    }}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "8px 12px",
                                                        borderRadius: 8,
                                                        cursor: "pointer",
                                                        background: "#F0FDF4",
                                                        border: "1px solid #A7F3D0",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "#DCFCE7";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "#F0FDF4";
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                                                        <span
                                                            className={`type-badge ${r.resourceType === "KUPPI_NOTES" ? "kuppi" : r.resourceType === "PAST_PAPER" ? "past-paper" : r.resourceType === "TUTE" ? "tute" : ""}`}
                                                            style={{ fontSize: 10, flexShrink: 0 }}
                                                        >
                                                            {r.resourceType?.replace("_", " ")}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 600,
                                                                color: "#142B2A",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {r.title}
                                                        </span>
                                                        {r.courseName && (
                                                            <span style={{ fontSize: 11.5, color: "#71827B", flexShrink: 0 }}>
                                                                {r.courseName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronRight size={15} color="#08B981" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "16px", color: "#71827B", fontSize: 13 }}>
                                No matching materials found for "{searchQuery}".
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                3. YOUR BATCH OVERVIEW – THREE KPI CARDS
            ───────────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#142B2A",
                        margin: "0 0 4px",
                    }}
                >
                    Your Batch Overview
                </h2>
                <p style={{ fontSize: 13.5, color: "#71827B", margin: "0 0 16px" }}>
                    Key information and activity from {batchDisplayName}.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 16,
                    }}
                >
                    {/* KPI 1 – Courses */}
                    <div
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #DCECE4",
                            borderRadius: 14,
                            padding: "20px 22px",
                            boxShadow: "0 1px 3px rgba(20, 43, 42, 0.04)",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: 12,
                                background: "#E5F6EE",
                                color: "#08B981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: "#142B2A", lineHeight: 1 }}>
                                {statsLoading ? "—" : (stats?.courseCount ?? myBatch?.courseCount ?? courses.length ?? 0)}
                            </div>
                            <div style={{ fontSize: 12.5, color: "#71827B", marginTop: 4 }}>
                                in your batch
                            </div>
                        </div>
                    </div>

                    {/* KPI 2 – Resources */}
                    <div
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #DCECE4",
                            borderRadius: 14,
                            padding: "20px 22px",
                            boxShadow: "0 1px 3px rgba(20, 43, 42, 0.04)",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: 12,
                                background: "#E5F6EE",
                                color: "#08B981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <FileText size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: "#142B2A", lineHeight: 1 }}>
                                {statsLoading ? "—" : (stats?.resourceCount ?? 0)}
                            </div>
                            <div style={{ fontSize: 12.5, color: "#71827B", marginTop: 4 }}>
                                shared in {batchDisplayName}
                            </div>
                        </div>
                    </div>

                    {/* KPI 3 – My Uploads */}
                    <div
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #DCECE4",
                            borderRadius: 14,
                            padding: "20px 22px",
                            boxShadow: "0 1px 3px rgba(20, 43, 42, 0.04)",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: 12,
                                background: "#E5F6EE",
                                color: "#08B981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <UploadCloud size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: "#142B2A", lineHeight: 1 }}>
                                {statsLoading ? "—" : (stats?.myUploadCount ?? 0)}
                            </div>
                            <div style={{ fontSize: 12.5, color: "#71827B", marginTop: 4 }}>
                                by you in {batchDisplayName}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                4. YOUR BATCH (SEPARATE HIGHLIGHTED CARD)
            ───────────────────────────────────────────────────────────── */}
            {myBatch && (
                <div style={{ marginBottom: 28 }}>
                    <div
                        onClick={() => navigate(`/dashboard/batches/${myBatch.id}`)}
                        style={{
                            background: "#FAFFFD",
                            border: "1.5px solid #A7F3D0",
                            borderRadius: 14,
                            padding: "20px 24px",
                            boxShadow: "0 2px 8px rgba(8, 185, 129, 0.08)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#08B981";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#A7F3D0";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: "#08B981",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <GraduationCap size={24} />
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        color: "#078E69",
                                        marginBottom: 2,
                                    }}
                                >
                                    Your Batch
                                </div>
                                <h3
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: "#142B2A",
                                        margin: "0 0 2px",
                                    }}
                                >
                                    {myBatch.name}
                                </h3>
                                <div style={{ fontSize: 13, color: "#71827B" }}>
                                    {formatBatchSubtitle(myBatch)}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#08B981", fontWeight: 600, fontSize: 13.5 }}>
                            <span>View Courses</span>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                5. OTHER BATCHES (EXCLUDING OWN BATCH)
            ───────────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#142B2A",
                        margin: "0 0 14px",
                    }}
                >
                    Other Batches
                </h2>

                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: 64,
                                    background: "#FFFFFF",
                                    border: "1px solid #DCECE4",
                                    borderRadius: 12,
                                    animation: "pulse 1.5s infinite ease",
                                }}
                            />
                        ))}
                    </div>
                ) : otherBatches.length === 0 ? (
                    <div
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #DCECE4",
                            borderRadius: 12,
                            padding: "20px",
                            textAlign: "center",
                            color: "#71827B",
                            fontSize: 13.5,
                        }}
                    >
                        No other batches available.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {otherBatches.map((batch) => (
                            <div
                                key={batch.id}
                                onClick={() => navigate(`/dashboard/batches/${batch.id}`)}
                                style={{
                                    background: "#FFFFFF",
                                    border: "1px solid #DCECE4",
                                    borderRadius: 12,
                                    padding: "16px 20px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    transition: "all 0.12s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#08B981";
                                    e.currentTarget.style.background = "#FAFFFD";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#DCECE4";
                                    e.currentTarget.style.background = "#FFFFFF";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 10,
                                            background: "#F1FAF5",
                                            color: "#08B981",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "#142B2A" }}>
                                            {batch.name}
                                        </div>
                                        <div style={{ fontSize: 12.5, color: "#71827B" }}>
                                            {formatBatchSubtitle(batch)}
                                        </div>
                                    </div>
                                </div>

                                <ChevronRight size={18} color="#71827B" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                6. CROSS-BATCH RESOURCE ACCESS INFORMATION
            ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    background: "#E5F6EE",
                    border: "1px solid #DCECE4",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#078E69",
                        flexShrink: 0,
                    }}
                >
                    <Info size={18} />
                </div>
                <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#142B2A" }}>
                        Access Batch Resources
                    </div>
                    <div style={{ fontSize: 12.5, color: "#71827B", marginTop: 2 }}>
                        View and download academic resources from your batch or other batches.
                    </div>
                </div>
            </div>
        </div>
    );
}
