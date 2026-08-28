export interface Batch {
    id: number;
    name: string;
    intakeYear: number;
}

export interface Course {
    id: number;
    code: string;
    name: string;
    academicYear: number;
    semesterNumber: number;
    batchName: string;
    canManage: boolean;
}

export interface Resource {
    id: number;
    title: string;
    fileUrl: string;
    resourceType: string;
    summary: string | null;
    courseName: string;
    uploadedByName: string;
    uploadedById: number;
    createdAt: string;
    canEdit: boolean;
}

export interface VoteSummary {
    upvotes: number;
    downvotes: number;
    userVote: number | null;
}

export interface Comment {
    id: number;
    content: string;
    userName: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    name: string;
    email: string;
    role: string;
    indexNo?: string;
    batchId?: number | null;
    batchName?: string | null;
    academicYear?: number;
}