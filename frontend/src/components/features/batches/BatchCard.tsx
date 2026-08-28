import { Link } from "react-router-dom";
import { type Batch } from "../../../types";

function BatchCard({ batch }: { batch: Batch }) {
    return (
        <Link to={`/dashboard/batches/${batch.id}`} className="hover-lift"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", marginBottom: 10, backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: 12 }}>
            <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{batch.name}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Intake {batch.intakeYear}</div>
            </div>
            <span style={{ color: "var(--color-text-muted)" }}>→</span>
        </Link>
    );
}

export default BatchCard;