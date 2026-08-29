import client from "./client";
import { type Course, type CourseModerator } from "../types";

export const courseService = {
    getAll: () =>
        client.get<Course[]>("/courses"),

    getByBatch: (batchId: string | number) =>
        client.get<Course[]>(`/courses/batch/${batchId}`),

    getByBatchAndSemester: (batchId: string | number, year: number, semester: number) =>
        client.get<Course[]>(`/courses/batch/${batchId}/year/${year}/semester/${semester}`),

    getById: (id: string | number) =>
        client.get<Course>(`/courses/${id}`),

    create: (courseData: { code: string; name: string; academicYear: number; semesterNumber: number; batchId: number }) =>
        client.post<Course>("/courses", courseData),

    update: (id: string | number, courseData: { code: string; name: string; academicYear: number; semesterNumber: number; batchId: number }) =>
        client.put<Course>(`/courses/${id}`, courseData),

    delete: (id: string | number) =>
        client.delete<void>(`/courses/${id}`),

    getAllModerators: () =>
        client.get<CourseModerator[]>("/courses/moderators"),

    assignModerator: (courseId: number | string, userId: number | string) =>
        client.post<void>(`/courses/${courseId}/moderators/${userId}`),

    removeModerator: (courseId: number | string, userId: number | string) =>
        client.delete<void>(`/courses/${courseId}/moderators/${userId}`),
};