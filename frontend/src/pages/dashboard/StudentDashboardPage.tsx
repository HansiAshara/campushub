import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { batchService } from "../../api/batchService";
import { userService, type UserResponse } from "../../api/userService";
import { courseService } from "../../api/courseService";
import { resourceService } from "../../api/resourceService";
import { type Batch, type BatchStats, type Course, type Resource } from "../../types";
import { getBatchAcademicYear } from "../../utils/batchUtils";
import { formatRelativeTime } from "../../utils/dateUtils";
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
    Video,
} from "lucide-react";

export default function StudentDashboardPage() {
    const navigate = useNavigate();

    // Data states
    const [batches, setBatches] = useState<Batch[]>([]);
    const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
    const [stats, setStats] = useState<BatchStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [recentUploads, setRecentUploads] = useState<Resource[]>([]);
    const [recentLoading, setRecentLoading] = useState(true);
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

    // 3. Fetch batch-specific statistics (KPIs), courses for search, and recent batch uploads
    useEffect(() => {
        if (!effectiveBatchId) {
            setStatsLoading(false);
            setRecentLoading(false);
            return;
        }

        let isMounted = true;
        setStatsLoading(true);
        setRecentLoading(true);

        Promise.all([
            batchService.getStats(effectiveBatchId).catch(() => null),
            courseService.getByBatch(effectiveBatchId).catch(() => ({ data: [] })),
            resourceService.getRecentByBatch(effectiveBatchId).catch(() => ({ data: [] })),
        ])
            .then(([statsRes, coursesRes, recentRes]) => {
                if (!isMounted) return;
                if (statsRes?.data) {
                    setStats(statsRes.data);
                }
                setCourses(coursesRes.data || []);
                setRecentUploads(recentRes.data || []);
            })
            .finally(() => {
                if (isMounted) {
                    setStatsLoading(false);
                    setRecentLoading(false);
                }
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

    // Search filtering across courses in the student's batch
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

    // Trigger AI semantic search strictly scoped to the student's batch on the backend
    const handleTriggerSemantic = async () => {
        if (!searchQuery.trim()) return;
        setSemanticLoading(true);
        try {
            const res = await resourceService.semanticSearch(
                undefined,
                searchQuery.trim(),
                0.15,
                effectiveBatchId || undefined
            );
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

    const handleSelectResource = (resource: Resource) => {
        setSearchOpen(false);
        const targetCourseId =
            resource.courseId ||
            courses.find(
                (c) => resource.courseName?.includes(c.code) || resource.courseName === c.name
            )?.id;

        if (targetCourseId) {
            navigate(`/dashboard/courses/${targetCourseId}`);
        } else if (resource.fileUrl) {
            window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
        }
    };

    // Calculate dynamic greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const studentName = (userProfile?.name || storedName).split(" ")[0] || "Student";
    const batchDisplayName = myBatch?.name || (effectiveBatchId ? `Batch ${effectiveBatchId}` : "Batch");

    // Format subtitle matching the design: IN2101 · Object Oriented Programming · Recently uploaded
    const formatResourceSubtitle = (resource: Resource): string => {
        const rawCourse = resource.courseName || "";
        const coursePart = rawCourse.includes(" - ")
            ? rawCourse.split(" - ").join(" · ")
            : rawCourse;

        const date = resource.createdAt ? new Date(resource.createdAt) : null;
        const isRecent = date ? (Date.now() - date.getTime()) < 5 * 24 * 60 * 60 * 1000 : true;
        const timeLabel = isRecent ? "Recently uploaded" : formatRelativeTime(resource.createdAt);

        return coursePart ? `${coursePart} · ${timeLabel}` : timeLabel;
    };

    const hasSearchResults =
        matchedCourses.length > 0 || (semanticResults && semanticResults.length > 0);

    return (
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 32px 60px" }}>
            {/* ─────────────────────────────────────────────────────────────
                1. PERSONALIZED WELCOME BANNER
            ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #DCECE4",
                    borderRadius: 14,
                    padding: "22px 28px",
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
                2. UNIFIED YOUR BATCH SECTION (IDENTITY + SEARCH + KPIS)
            ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #DCECE4",
                    borderRadius: 16,
                    padding: "24px 28px",
                    boxShadow: "0 1px 3px rgba(20, 43, 42, 0.04)",
                    marginBottom: 24,
                }}
            >
                {/* ── Top Row: Batch Identity & Context ── */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        paddingBottom: 20,
                        borderBottom: "1px solid #EBF5F0",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: "#08B981",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        padding: "2px 7px",
                                        borderRadius: 5,
                                        background: "#E5F6EE",
                                        color: "#078E69",
                                    }}
                                >
                                    Your Batch
                                </span>
                                <h2
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: 19,
                                        fontWeight: 800,
                                        color: "#142B2A",
                                        margin: 0,
                                    }}
                                >
                                    {batchDisplayName}
                                </h2>
                            </div>
                            <div style={{ fontSize: 13, color: "#71827B" }}>
                                {myBatch?.intakeYear ? `Intake ${myBatch.intakeYear} · ` : ""}Year {academicYear} · Semester {currentSemester}
                            </div>
                        </div>
                    </div>

                    {myBatch && (
                        <button
                            type="button"
                            onClick={() => navigate(`/dashboard/batches/${myBatch.id}`)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 14px",
                                borderRadius: 8,
                                border: "1px solid #DCECE4",
                                background: "#FAFFFD",
                                color: "#08B981",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.12s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#E5F6EE";
                                e.currentTarget.style.borderColor = "#08B981";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#FAFFFD";
                                e.currentTarget.style.borderColor = "#DCECE4";
                            }}
                        >
                            <span>View Batch Courses</span>
                            <ChevronRight size={15} />
                        </button>
                    )}
                </div>

                {/* ── Middle: Batch-Scoped Resource Search ── */}
                <div style={{ padding: "20px 0" }}>
                    <div style={{ marginBottom: 12 }}>
                        <h3
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#142B2A",
                                margin: "0 0 2px",
                            }}
                        >
                            Find Academic Resources
                        </h3>
                        <p style={{ fontSize: 13, color: "#71827B", margin: 0 }}>
                            Search resources shared within your batch.
                        </p>
                    </div>

                    {/* Search Input Bar */}
                    <div ref={searchContainerRef} style={{ position: "relative" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                background: "#FAFFFD",
                                border: `1.5px solid ${searchOpen ? "#08B981" : "#DCECE4"}`,
                                borderRadius: 12,
                                padding: "5px 10px 5px 16px",
                                boxShadow: searchOpen
                                    ? "0 4px 16px rgba(8, 185, 129, 0.12)"
                                    : "0 1px 2px rgba(20, 43, 42, 0.03)",
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
                                title="Search resources in this batch"
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
                                    maxHeight: 380,
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
                                                            onClick={() => handleSelectResource(r)}
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
                                        No matching materials found in your batch for "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom: Three Batch-Specific KPI Cards ── */}
                <div style={{ borderTop: "1px solid #EBF5F0", paddingTop: 20 }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 14,
                        }}
                    >
                        {/* KPI 1 – Courses */}
                        <div
                            style={{
                                background: "#FAFFFD",
                                border: "1px solid #EBF5F0",
                                borderRadius: 12,
                                padding: "16px 18px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "#E5F6EE",
                                    color: "#08B981",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#142B2A", lineHeight: 1 }}>
                                    {statsLoading ? "—" : (stats?.courseCount ?? myBatch?.courseCount ?? courses.length ?? 0)}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#142B2A", marginTop: 3 }}>
                                    Courses
                                </div>
                                <div style={{ fontSize: 11.5, color: "#71827B" }}>
                                    Available
                                </div>
                            </div>
                        </div>

                        {/* KPI 2 – Resources */}
                        <div
                            style={{
                                background: "#FAFFFD",
                                border: "1px solid #EBF5F0",
                                borderRadius: 12,
                                padding: "16px 18px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "#E5F6EE",
                                    color: "#08B981",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <FileText size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#142B2A", lineHeight: 1 }}>
                                    {statsLoading ? "—" : (stats?.resourceCount ?? 0)}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#142B2A", marginTop: 3 }}>
                                    Resources
                                </div>
                                <div style={{ fontSize: 11.5, color: "#71827B" }}>
                                    Shared
                                </div>
                            </div>
                        </div>

                        {/* KPI 3 – My Uploads */}
                        <div
                            style={{
                                background: "#FAFFFD",
                                border: "1px solid #EBF5F0",
                                borderRadius: 12,
                                padding: "16px 18px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "#E5F6EE",
                                    color: "#08B981",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <UploadCloud size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#142B2A", lineHeight: 1 }}>
                                    {statsLoading ? "—" : (stats?.myUploadCount ?? 0)}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#142B2A", marginTop: 3 }}>
                                    My Uploads
                                </div>
                                <div style={{ fontSize: 11.5, color: "#71827B" }}>
                                    Contributed
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                3. RECENT BATCH UPLOADS (REPLACING THE DUPLICATE BATCH LIST)
            ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #DCECE4",
                    borderRadius: 16,
                    padding: "22px 24px",
                    boxShadow: "0 1px 3px rgba(20, 43, 42, 0.04)",
                    marginBottom: 24,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#142B2A",
                            margin: 0,
                        }}
                    >
                        Recent Batch Uploads
                    </h2>

                    {myBatch && (
                        <button
                            type="button"
                            onClick={() => navigate(`/dashboard/batches/${myBatch.id}`)}
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#08B981",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <span>View All</span>
                            <span>→</span>
                        </button>
                    )}
                </div>

                {recentLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: 52,
                                    background: "#FAFFFD",
                                    borderRadius: 10,
                                    animation: "pulse 1.5s infinite ease",
                                }}
                            />
                        ))}
                    </div>
                ) : recentUploads.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "24px 16px",
                            color: "#71827B",
                            fontSize: 13.5,
                        }}
                    >
                        No recent materials uploaded in your batch yet.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {recentUploads.map((resource, index) => {
                            const isLast = index === recentUploads.length - 1;
                            const isVideo =
                                resource.resourceType === "KUPPI_NOTES" ||
                                resource.fileUrl?.includes("youtube") ||
                                resource.fileUrl?.includes("youtu.be");

                            const badgeType = isVideo
                                ? { label: "Video", bg: "#E5F6EE", color: "#078E69" }
                                : resource.resourceType === "SLIDES"
                                ? { label: "Slides", bg: "#EFF6FF", color: "#2563EB" }
                                : resource.resourceType === "TUTE"
                                ? { label: "Tute", bg: "#FEF3C7", color: "#B45309" }
                                : { label: "PDF", bg: "#FEF2F2", color: "#DC2626" };

                            return (
                                <div
                                    key={resource.id}
                                    onClick={() => handleSelectResource(resource)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 14,
                                        padding: "13px 0",
                                        borderBottom: isLast ? "none" : "1px solid #EBF5F0",
                                        cursor: "pointer",
                                        transition: "all 0.12s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.paddingLeft = "4px";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.paddingLeft = "0px";
                                    }}
                                >
                                    {/* Left: Icon and Title/Subtitle */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                background: "#E5F6EE",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {isVideo ? (
                                                <Video size={18} color="#08B981" />
                                            ) : (
                                                <FileText size={18} color="#08B981" />
                                            )}
                                        </div>

                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: 14.5,
                                                    fontWeight: 700,
                                                    color: "#142B2A",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {resource.title}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12.5,
                                                    color: "#71827B",
                                                    marginTop: 2,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {formatResourceSubtitle(resource)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Badge */}
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            padding: "3px 9px",
                                            borderRadius: 6,
                                            background: badgeType.bg,
                                            color: badgeType.color,
                                            flexShrink: 0,
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        {badgeType.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                4. CROSS-BATCH RESOURCE ACCESS BANNER
            ───────────────────────────────────────────────────────────── */}
            <div
                style={{
                    background: "#E5F6EE",
                    border: "1px solid #DCECE4",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                        <Info size={17} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#142B2A" }}>
                            Access Batch Resources
                        </div>
                        <div style={{ fontSize: 12.5, color: "#71827B", marginTop: 2 }}>
                            Looking for past papers or exploring curriculum from other batches? Uploading and editing are restricted to your authorized batch.
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard/batches")}
                    style={{
                        border: "1px solid #DCECE4",
                        background: "#FFFFFF",
                        color: "#078E69",
                        padding: "6px 12px",
                        borderRadius: 7,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        whiteSpace: "nowrap",
                    }}
                >
                    <span>Browse All Batches</span>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
