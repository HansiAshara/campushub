import { type Batch } from "../types";

/**
 * Calculates the current academic year (1 to 4) for a given batch.
 * Example:
 * - Batch 24 (Intake 2024) -> Year 1
 * - Batch 23 (Intake 2023) -> Year 2
 * - Batch 22 (Intake 2022) -> Year 3
 * - Batch 21 (Intake 2021) -> Year 4
 */
export function getBatchAcademicYear(batch?: { name?: string; intakeYear?: number } | null): number {
    if (!batch) return 1;

    if (batch.intakeYear) {
        const year = 2024 - batch.intakeYear + 1;
        if (year < 1) return 1;
        if (year > 4) return 4;
        return year;
    }

    if (batch.name) {
        const match = batch.name.match(/\d+/);
        if (match) {
            const num = parseInt(match[0]);
            if (num >= 20 && num <= 30) {
                const year = 24 - num + 1;
                if (year < 1) return 1;
                if (year > 4) return 4;
                return year;
            }
        }
    }

    return 1;
}

/**
 * Returns formatted subtitle with Intake year and Academic year.
 * e.g. "Intake 2021 · Year 4"
 */
export function formatBatchSubtitle(batch: Batch | { name?: string; intakeYear?: number }): string {
    const year = getBatchAcademicYear(batch);
    const intake = batch.intakeYear ? `Intake ${batch.intakeYear}` : "";
    return intake ? `${intake} · Year ${year}` : `Year ${year}`;
}
