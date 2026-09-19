import api from "./client";

export interface BatchQueryRequest {
    category: string;
    message: string;
}

export interface BatchQueryResponse {
    id: number;
    batchId: number;
    studentName: string;
    studentIndexNo: string;
    category: string;
    message: string;
    status: string;
    createdAt: string;
}

export const batchQueryService = {
    create: (batchId: number, data: BatchQueryRequest) =>
        api.post<BatchQueryResponse>(`/batches/${batchId}/queries`, data),

    getByBatch: (batchId: number) =>
        api.get<BatchQueryResponse[]>(`/batches/${batchId}/queries`),

    resolve: (queryId: number) =>
        api.patch<BatchQueryResponse>(`/batches/queries/${queryId}/resolve`)
};
