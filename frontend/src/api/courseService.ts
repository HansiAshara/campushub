import client from "./client";
import { type Course } from "../types";

export const courseService = {
    getByBatch: (batchId: string | number) =>
        client.get<Course[]>(`/courses/batch/${batchId}`),

    getByBatchAndSemester: (batchId: string | number, year: number, semester: number) =>
        client.get<Course[]>(`/courses/batch/${batchId}/year/${year}/semester/${semester}`),

    getById: (id: string | number) =>
        client.get<Course>(`/courses/${id}`),
};