import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../api/api';
import { AgentCard } from '../components/AgentCard';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';

export default function AgentDetailsPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAgent = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get(`/api/agents/${id}`);
      setAgent(data.agent);
      setProperties(data.properties);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  if (loading) return <LoadingState text="Loading agent..." />;

  return (
    <div className="container page">
      <Link to="/agents" className="back-link">
        ← All agents
      </Link>
      <ErrorMessage message={error} onRetry={loadAgent} />

      {agent && (
        <>
          <div className="agent-profile card">
            <AgentCard agent={{ ...agent, listingCount: properties.length }} showContact />
            {agent.bio && <p className="agent-bio">{agent.bio}</p>}
          </div>

          <h2>Listings by {agent.user?.name}</h2>
          {properties.length === 0 ? (
            <p className="muted">No active listings right now.</p>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
