import client from "./client";
import { type Batch } from "../types";

export const batchService = {
    getAll: () => client.get<Batch[]>("/batches"),
    create: (batchData: { name: string; intakeYear: number }) => client.post<Batch>("/batches", batchData),
    assignBatchLeader: (batchId: number | string, userId: number | string) => client.post<void>(`/batches/${batchId}/leader/${userId}`),
};