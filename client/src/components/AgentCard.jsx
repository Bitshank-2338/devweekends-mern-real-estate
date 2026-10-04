import { Link } from 'react-router';
import { initials } from '../utils/format';

// Used on the agents page, the homepage and beside a property's details.
// `showContact` adds the phone and email (on the property page).
export function AgentCard({ agent, showContact = false }) {
  const name = agent.user?.name || 'EstateNest agent';

  return (
    <article className="agent-card">
      <div className="avatar" aria-hidden="true">
        {initials(name)}
      </div>
      <div className="agent-card-body">
        <h3>
          <Link to={`/agents/${agent._id}`}>{name}</Link>
        </h3>
        <p className="muted">
          {agent.agency} · {agent.city}
        </p>
        <p className="small">
          {agent.experienceYears} yrs experience
          {agent.listingCount !== undefined && ` · ${agent.listingCount} listings`}
        </p>

        {showContact && (
          <ul className="agent-contact small">
            <li>
              <a href={`tel:${agent.phone.replace(/\s/g, '')}`}>{agent.phone}</a>
            </li>
            {agent.user?.email && (
              <li>
                <a href={`mailto:${agent.user.email}`}>{agent.user.email}</a>
              </li>
            )}
          </ul>
        )}

        {agent.specialties?.length > 0 && (
          <ul className="tag-list">
            {agent.specialties.map((specialty) => (
              <li key={specialty}>{specialty}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
