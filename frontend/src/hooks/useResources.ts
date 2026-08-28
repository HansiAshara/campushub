import { useEffect, useState, useCallback } from "react";
import { resourceService } from "../api/resourceService";
import { type Resource } from "../types";

export function useResourcesByCourse(courseId: string | undefined) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(() => {
        if (!courseId) return;
        setLoading(true);
        resourceService.getByCourse(courseId).then((res) => setResources(res.data)).finally(() => setLoading(false));
    }, [courseId]);

    useEffect(refetch, [refetch]);

    return { resources, loading, refetch };
}

export function useMyResources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(() => {
        setLoading(true);
        resourceService.getMine().then((res) => setResources(res.data)).finally(() => setLoading(false));
    }, []);

    useEffect(refetch, [refetch]);

    return { resources, loading, refetch };
}