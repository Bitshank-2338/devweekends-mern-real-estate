import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/api';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { AgentCard } from '../components/AgentCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=60&auto=format&fit=crop`;

const CATEGORIES = [
  { type: 'Apartment', image: unsplash('1545324418-cc1a3fa10c00') },
  { type: 'Villa', image: unsplash('1613490493576-7fde63acd811') },
  { type: 'House', image: unsplash('1568605114967-8130f3a36994') },
  { type: 'Studio', image: unsplash('1560448204-e02f11c3d0e2') },
  { type: 'Commercial', image: unsplash('1497366216548-37526070297c') },
  { type: 'Land', image: unsplash('1500382017468-9049fed747ef') },
];

const BENEFITS = [
  {
    title: 'Listings with real details',
    text: 'Every home shows price, area, rooms and amenities up front, so you can compare quickly.',
  },
  {
    title: 'Talk to the right agent',
    text: 'Inquiries go straight to the agent who manages the property, and you can track their status.',
  },
  {
    title: 'Visits on your schedule',
    text: 'Pick a date and time, and see when the agent confirms. Reschedule or cancel any time.',
  },
  {
    title: 'Honest reviews',
    text: 'Buyers who visited share what they liked, one review per person per property.',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHomepage = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [propertyData, agentData] = await Promise.all([
        api.get('/api/properties?featured=true&limit=6'),
        api.get('/api/agents?limit=3'),
      ]);
      setFeatured(propertyData.properties);
      setAgents(agentData.agents);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomepage();
  }, [loadHomepage]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Find a place that feels like home.</p>
          <h1>Find a place you’ll love coming home to.</h1>
          <p className="hero-subtitle">
            Explore homes for sale and rent, connect with trusted agents, and schedule property
            visits in one place.
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="section container">
        <div className="section-header">
          <div>
            <h2>Featured properties</h2>
            <p className="muted">Hand-picked homes across India’s favourite cities.</p>
          </div>
          <Link to="/properties" className="btn btn-outline">
            View all
          </Link>
        </div>

        {loading && <LoadingState text="Loading featured homes..." />}
        <ErrorMessage message={error} onRetry={loadHomepage} />
        {!loading && !error && (
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="section section-tinted">
        <div className="container">
          <h2>Browse by category</h2>
          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <Link
                key={category.type}
                to={`/properties?propertyType=${category.type}`}
                className="category-tile"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <span>{category.type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {agents.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2>Featured agents</h2>
              <p className="muted">Local experts who know their neighbourhoods.</p>
            </div>
            <Link to="/agents" className="btn btn-outline">
              All agents
            </Link>
          </div>
          <div className="agent-grid">
            {agents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      <section className="section section-tinted">
        <div className="container">
          <h2>Why choose EstateNest</h2>
          <div className="benefit-grid">
            {BENEFITS.map((benefit) => (
              <article key={benefit.title} className="benefit">
                <h3>{benefit.title}</h3>
                <p className="muted">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="cta">
          <div>
            <h2>Are you an agent?</h2>
            <p>List properties, manage inquiries and confirm visits from one simple dashboard.</p>
          </div>
          <div className="cta-actions">
            <Link to="/register?role=agent" className="btn btn-light">
              List a property
            </Link>
            <Link to="/properties" className="btn btn-ghost">
              Browse homes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
