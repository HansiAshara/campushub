import client from "./client";
import { type Batch } from "../types";

export const batchService = {
    getAll: () => client.get<Batch[]>("/batches"),
    create: (batchData: { name: string; intakeYear: number }) => client.post<Batch>("/batches", batchData),
    update: (id: number | string, batchData: { name: string; intakeYear: number }) => client.put<Batch>(`/batches/${id}`, batchData),
    delete: (id: number | string) => client.delete<void>(`/batches/${id}`),
    assignBatchLeader: (batchId: number | string, userId: number | string) => client.post<void>(`/batches/${batchId}/leader/${userId}`),
    removeBatchLeader: (batchId: number | string) => client.delete<void>(`/batches/${batchId}/leader`),
};