import { useMyResources } from "../../hooks/useResources";
import ResourceItem from "../../components/features/resources/ResourceItem";
import WelcomeHeader from "../../components/common/WelcomeHeader";

function MyUploadsPage() {
    const { resources, loading, refetch } = useMyResources();

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <WelcomeHeader subtitle={`You've shared ${resources.length} resource${resources.length === 1 ? "" : "s"}`} />
            {resources.length === 0 ? <p style={{ color: "var(--color-text-muted)" }}>You haven't uploaded anything yet.</p> : resources.map((r) => <ResourceItem key={r.id} resource={r} onChanged={refetch} />)}
        </div>
    );
}

export default MyUploadsPage;