export interface Course {
    id: number;
    code: string;
    name: string;
    semester: string;
}

export interface Resource {
    id: number;
    title: string;
    fileUrl: string;
    resourceType: string;
    summary: string | null;
    courseName: string;
    uploadedByName: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    name: string;
    email: string;
    role: string;
}