import client from "./client";

export interface CourseQuery {
    id: number;
    courseId: number;
    studentName: string;
    studentIndexNo: string | null;
    category: string;
    message: string;
    status: "OPEN" | "RESOLVED";
    createdAt: string;
}

export interface CourseQueryRequest {
    category: string;
    message: string;
}

export const courseQueryService = {
    create: (courseId: string | number, request: CourseQueryRequest) =>
        client.post<CourseQuery>(`/courses/${courseId}/queries`, request),

    getByCourse: (courseId: string | number) =>
        client.get<CourseQuery[]>(`/courses/${courseId}/queries`),

    resolve: (queryId: string | number) =>
        client.put<CourseQuery>(`/courses/queries/${queryId}/resolve`),
};
