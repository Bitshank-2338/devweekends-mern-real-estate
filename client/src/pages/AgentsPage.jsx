import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api';
import { AgentCard } from '../components/AgentCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get('/api/agents');
      setAgents(data.agents);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Our agents</h1>
        <p className="muted">Talk to someone who knows the neighbourhood.</p>
      </header>

      {loading && <LoadingState text="Loading agents..." />}
      <ErrorMessage message={error} onRetry={loadAgents} />

      {!loading && !error && agents.length === 0 && (
        <p className="empty-state">No agent profiles yet.</p>
      )}

      <div className="agent-grid">
        {agents.map((agent) => (
          <AgentCard key={agent._id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
