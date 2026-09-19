export interface Batch {
    id: number;
    name: string;
    intakeYear: number;
    leaderId?: number | null;
    leaderName?: string | null;
    leaderEmail?: string | null;
    leaderIndexNo?: string | null;
    studentCount?: number;
    courseCount?: number;
}

export interface Course {
    id: number;
    code: string;
    name: string;
    academicYear: number;
    semesterNumber: number;
    batchName: string;
    batchId?: number;
    canManage: boolean;
    moderatorName?: string | null;
    moderatorIndexNo?: string | null;
}

export interface CourseModerator {
    id: number;
    courseId: number;
    courseCode: string;
    courseName: string;
    batchId: number;
    batchName: string;
    userId: number;
    userName: string;
    userEmail: string;
    userIndexNo?: string | null;
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
    averageRating: number;
    totalRatings: number;
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
    userId?: number;
}