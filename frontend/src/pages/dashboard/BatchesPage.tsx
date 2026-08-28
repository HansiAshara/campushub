import { useEffect, useState } from "react";
import { batchService } from "../../api/batchService";
import { type Batch } from "../../types";
import BatchCard from "../../components/features/batches/BatchCard";
import WelcomeHeader from "../../components/common/WelcomeHeader";

function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        batchService.getAll().then((res) => setBatches(res.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <WelcomeHeader subtitle="Choose your batch to browse resources" />
            {batches.length === 0 ? <p style={{ color: "var(--color-text-muted)" }}>No batches added yet.</p> : batches.map((b) => <BatchCard key={b.id} batch={b} />)}
        </div>
    );
}

export default BatchesPage;