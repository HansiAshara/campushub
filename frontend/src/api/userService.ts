import client from "./client";

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: string;
    indexNo?: string;
    batchId?: number;
    batchName?: string;
    academicYear?: number;
}

export const userService = {
    search: (query: string = "") =>
        client.get<UserResponse[]>(`/users?query=${encodeURIComponent(query)}`),

    getMyProfile: () =>
        client.get<UserResponse>("/users/me"),

    updateAdminProfile: (data: { batchId: number; academicYear?: number; indexNo?: string }) =>
        client.put<UserResponse>("/users/admin/profile", data),
};
