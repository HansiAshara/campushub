import { useEffect, useState } from "react";
import { courseService } from "../api/courseService";
import { type Course } from "../types";

export function useCoursesByBatch(batchId: string | undefined, year: number, semester: number) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!batchId) return;
        setLoading(true);
        courseService.getByBatchAndSemester(batchId, year, semester)
            .then((res) => setCourses(res.data))
            .finally(() => setLoading(false));
    }, [batchId, year, semester]);

    return { courses, loading };
}