import client from "./client";
import { type Comment } from "../types";

export const commentService = {
    getByResource: (resourceId: number) =>
        client.get<Comment[]>(`/resources/${resourceId}/comments`),

    add: (resourceId: number, content: string) =>
        client.post<Comment>(`/resources/${resourceId}/comments`, { content }),

    remove: (commentId: number) =>
        client.delete(`/resources/${commentId}`),
};