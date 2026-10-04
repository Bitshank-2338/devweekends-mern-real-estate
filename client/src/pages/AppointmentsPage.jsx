import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDate, toDateInputValue, todayInputValue } from '../utils/format';

// Which status buttons an agent sees for each current status.
const AGENT_ACTIONS = {
  requested: [
    { status: 'confirmed', label: 'Confirm' },
    { status: 'cancelled', label: 'Decline' },
  ],
  confirmed: [
    { status: 'completed', label: 'Mark completed' },
    { status: 'cancelled', label: 'Cancel' },
  ],
  completed: [],
  cancelled: [],
};

function AppointmentItem({ appointment, role, onUpdate, onDelete }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [values, setValues] = useState({
    date: toDateInputValue(appointment.date),
    time: appointment.time,
    message: appointment.message || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function runAction(action) {
    setError('');
    setSaving(true);

    try {
      await action();
      setRescheduling(false);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  const isOpen = appointment.status === 'requested' || appointment.status === 'confirmed';

  return (
    <li className="card list-item">
      <div className="list-item-header">
        <div>
          <h3>
            {appointment.property ? (
              <Link to={`/properties/${appointment.property._id}`}>{appointment.property.title}</Link>
            ) : (
              'Removed property'
            )}
          </h3>
          <p className="visit-time">
            {formatDate(appointment.date)} at {appointment.time}
          </p>
          <p className="muted small">
            {role === 'agent'
              ? `Buyer: ${appointment.buyer?.name} (${appointment.buyer?.email})`
              : `Agent: ${appointment.agent?.name}`}
            {appointment.property && ` · ${appointment.property.address}, ${appointment.property.city}`}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <ErrorMessage message={error} />

      {appointment.message && !rescheduling && <p className="list-item-message">{appointment.message}</p>}

      {rescheduling && (
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            runAction(() => onUpdate(appointment._id, values));
          }}
        >
          <div className="form-grid">
            <label>
              Date
              <input
                type="date"
                name="date"
                min={todayInputValue()}
                value={values.date}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Time
              <input type="time" name="time" value={values.time} onChange={handleChange} required />
            </label>
          </div>
          <label>
            Note
            <textarea name="message" rows="2" value={values.message} onChange={handleChange} maxLength={500} />
          </label>
          <p className="muted small">A new date or time needs the agent to confirm again.</p>
          <div className="form-actions">
            <button type="submit" className="btn btn-small" disabled={saving}>
              Save
            </button>
            <button type="button" className="btn btn-small btn-outline" onClick={() => setRescheduling(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {role === 'agent' && AGENT_ACTIONS[appointment.status].length > 0 && (
        <div className="card-actions">
          {AGENT_ACTIONS[appointment.status].map((action) => (
            <button
              key={action.status}
              type="button"
              className={`btn btn-small ${action.status === 'cancelled' ? 'btn-outline' : ''}`}
              disabled={saving}
              onClick={() => runAction(() => onUpdate(appointment._id, { status: action.status }))}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {role === 'buyer' && !rescheduling && (
        <div className="card-actions">
          {isOpen && (
            <>
              <button type="button" className="btn btn-small btn-outline" onClick={() => setRescheduling(true)}>
                Reschedule
              </button>
              <button
                type="button"
                className="btn btn-small btn-outline"
                disabled={saving}
                onClick={() => runAction(() => onUpdate(appointment._id, { status: 'cancelled' }))}
              >
                Cancel visit
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-small btn-danger"
            disabled={saving}
            onClick={() => {
              if (window.confirm('Delete this visit from your list?')) {
                runAction(() => onDelete(appointment._id));
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get('/api/appointments');
      setAppointments(data.appointments);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleUpdate(appointmentId, changes) {
    const data = await api.put(`/api/appointments/${appointmentId}`, changes);
    setAppointments((current) =>
      current.map((item) => (item._id === data.appointment._id ? data.appointment : item))
    );
  }

  async function handleDelete(appointmentId) {
    await api.delete(`/api/appointments/${appointmentId}`);
    setAppointments((current) => current.filter((item) => item._id !== appointmentId));
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1>{user.role === 'agent' ? 'Visit requests' : 'My property visits'}</h1>
        <p className="muted">
          {user.role === 'agent'
            ? 'Confirm, complete or decline visits to your properties.'
            : 'Reschedule or cancel the visits you have requested.'}
        </p>
      </header>

      {loading && <LoadingState text="Loading visits..." />}
      <ErrorMessage message={error} onRetry={loadAppointments} />

      {!loading && !error && appointments.length === 0 && (
        <div className="empty-state">
          <p className="muted">No visits scheduled yet.</p>
          {user.role === 'buyer' && (
            <Link to="/properties" className="btn">
              Find a property to visit
            </Link>
          )}
        </div>
      )}

      <ul className="item-list">
        {appointments.map((appointment) => (
          <AppointmentItem
            key={appointment._id}
            appointment={appointment}
            role={user.role}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
