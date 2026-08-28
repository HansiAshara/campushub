import client from "./client";
import { type Batch } from "../types";

export const batchService = {
    getAll: () => client.get<Batch[]>("/batches"),
};