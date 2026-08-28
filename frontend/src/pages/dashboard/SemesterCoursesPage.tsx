import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCoursesByBatch } from "../../hooks/useCourses";
import CourseCard from "../../components/features/courses/CourseCard";
import SemesterSelector from "../../components/features/batches/SemesterSelector";

function SemesterCoursesPage() {
    const { batchId } = useParams();
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const { courses, loading } = useCoursesByBatch(batchId, year, semester);

    return (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Link to="/dashboard/batches" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>← Back to Batches</Link>
            <h1 style={{ fontSize: 26, margin: "10px 0 20px" }}>{courses[0]?.batchName || "Courses"}</h1>
            <SemesterSelector selectedYear={year} selectedSemester={semester} onSelect={(y, s) => { setYear(y); setSemester(s); }} />
            {loading ? <p>Loading...</p> : courses.length === 0 ? <p style={{ color: "var(--color-text-muted)" }}>No courses for this semester yet.</p> : courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
    );
}

export default SemesterCoursesPage;