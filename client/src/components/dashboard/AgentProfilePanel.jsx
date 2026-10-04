import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/api';
import { AgentCard } from '../AgentCard';
import { AgentProfileForm } from '../AgentProfileForm';
import { ErrorMessage } from '../ErrorMessage';

// Create, view, edit and delete the agent's public profile.
export function AgentProfilePanel({ profile, onChange }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values) {
    const data = profile
      ? await api.put(`/api/agents/${profile._id}`, values)
      : await api.post('/api/agents', values);

    onChange(data.agent);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm('Delete your public agent profile? Your listings will stay.')) return;
    setError('');

    try {
      await api.delete(`/api/agents/${profile._id}`);
      onChange(null);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!profile || editing) {
    return (
      <section className="card">
        <h2>{profile ? 'Edit agent profile' : 'Create your agent profile'}</h2>
        {!profile && (
          <p className="muted">
            Buyers see your agency, phone and experience on every listing you manage.
          </p>
        )}
        <AgentProfileForm
          profile={profile}
          onSubmit={handleSubmit}
          onCancel={profile ? () => setEditing(false) : undefined}
        />
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Agent profile</h2>
      <ErrorMessage message={error} />
      <AgentCard agent={profile} showContact />
      {profile.bio && <p className="agent-bio">{profile.bio}</p>}
      <div className="card-actions">
        <button type="button" className="btn btn-small btn-outline" onClick={() => setEditing(true)}>
          Edit profile
        </button>
        <Link to={`/agents/${profile._id}`} className="btn btn-small btn-outline">
          View public page
        </Link>
        <button type="button" className="btn btn-small btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </section>
  );
}
