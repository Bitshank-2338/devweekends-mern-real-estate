import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/api';
import { PropertyCard } from '../PropertyCard';
import { PropertyForm } from '../PropertyForm';
import { LoadingState } from '../LoadingState';
import { ErrorMessage } from '../ErrorMessage';
import { StatTile } from './StatTile';
import { AgentProfilePanel } from './AgentProfilePanel';
import { AppointmentPreviewList, InquiryPreviewList } from './ActivityLists';
import { getUpcomingAppointments } from '../../utils/appointments';

export function AgentDashboard() {
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [propertyError, setPropertyError] = useState('');
  // null = form hidden, 'new' = creating, or the property object being edited.
  const [editingProperty, setEditingProperty] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [profileData, propertyData, inquiryData, appointmentData] = await Promise.all([
        api.get('/api/agents/me'),
        api.get('/api/properties/mine'),
        api.get('/api/inquiries'),
        api.get('/api/appointments'),
      ]);
      setProfile(profileData.agent);
      setProperties(propertyData.properties);
      setInquiries(inquiryData.inquiries);
      setAppointments(appointmentData.appointments);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleSaveProperty(values) {
    if (editingProperty === 'new') {
      const data = await api.post('/api/properties', values);
      setProperties((current) => [data.property, ...current]);
    } else {
      const data = await api.put(`/api/properties/${editingProperty._id}`, values);
      setProperties((current) =>
        current.map((property) => (property._id === data.property._id ? data.property : property))
      );
    }
    setEditingProperty(null);
  }

  async function handleDeleteProperty(property) {
    if (!window.confirm(`Delete "${property.title}"? Its inquiries, visits and reviews go too.`)) {
      return;
    }
    setPropertyError('');

    try {
      await api.delete(`/api/properties/${property._id}`);
      setProperties((current) => current.filter((item) => item._id !== property._id));
    } catch (deleteError) {
      setPropertyError(deleteError.message);
    }
  }

  if (loading) return <LoadingState text="Loading your dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadDashboard} />;

  const upcoming = getUpcomingAppointments(appointments);
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === 'new');
  const pendingVisits = upcoming.filter((appointment) => appointment.status === 'requested');

  return (
    <>
      <div className="stat-grid">
        <StatTile label="My listings" value={properties.length} to="#listings" />
        <StatTile label="New inquiries" value={newInquiries.length} to="/inquiries" />
        <StatTile label="Visits to confirm" value={pendingVisits.length} to="/appointments" />
        <StatTile label="Upcoming visits" value={upcoming.length} to="/appointments" />
      </div>

      <div className="dashboard-grid">
        <AgentProfilePanel profile={profile} onChange={setProfile} />

        <section className="card">
          <h2>Inquiries received</h2>
          <InquiryPreviewList inquiries={inquiries} role="agent" />
          <h2 className="spaced-heading">Upcoming visits</h2>
          <AppointmentPreviewList appointments={upcoming} role="agent" />
        </section>
      </div>

      <section className="section-compact" id="listings">
        <div className="section-header">
          <h2>My properties</h2>
          {!editingProperty && (
            <button type="button" className="btn" onClick={() => setEditingProperty('new')}>
              + Add property
            </button>
          )}
        </div>

        {editingProperty && (
          <PropertyForm
            // key makes React build a fresh form when switching between properties.
            key={editingProperty === 'new' ? 'new' : editingProperty._id}
            property={editingProperty === 'new' ? null : editingProperty}
            onSubmit={handleSaveProperty}
            onCancel={() => setEditingProperty(null)}
          />
        )}

        <ErrorMessage message={propertyError} />

        {properties.length === 0 && !editingProperty && (
          <p className="muted">You have no listings yet. Add your first property.</p>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              actions={
                <>
                  <button
                    type="button"
                    className="btn btn-small btn-outline"
                    onClick={() => {
                      setEditingProperty(property);
                      window.scrollTo({ top: document.getElementById('listings').offsetTop - 80 });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteProperty(property)}
                  >
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}
