import client from "./client";
import { type Resource, type VoteSummary } from "../types";

export const resourceService = {
    getByCourse: (courseId: string | number) =>
        client.get<Resource[]>(`/resources/course/${courseId}`),

    getMine: () => client.get<Resource[]>("/resources/mine"),

    upload: (formData: FormData) =>
        client.post<Resource>("/resources", formData, { headers: { "Content-Type": "multipart/form-data" } }),

    update: (id: number, title: string, resourceType: string) =>
        client.put<Resource>(`/resources/${id}`, { title, resourceType }),

    remove: (id: number) => client.delete(`/resources/${id}`),

    vote: (resourceId: number, value: number) =>
        client.post<VoteSummary>(`/resources/${resourceId}/votes`, { value }),

    getVoteSummary: (resourceId: number) =>
        client.get<VoteSummary>(`/resources/${resourceId}/votes`),
};