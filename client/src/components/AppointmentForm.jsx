import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/api';
import { ErrorMessage } from './ErrorMessage';
import { todayInputValue } from '../utils/format';

export function AppointmentForm({ property }) {
  const [values, setValues] = useState({ date: '', time: '11:00', message: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/api/appointments', { property: property._id, ...values });
      setBooked(true);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (booked) {
    return (
      <div className="success-message" role="status">
        Visit requested. The agent will confirm it on your{' '}
        <Link to="/appointments">Visits</Link> page.
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
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
        Note for the agent <span className="muted small">(optional)</span>
        <textarea
          name="message"
          rows="3"
          value={values.message}
          onChange={handleChange}
          maxLength={500}
        />
      </label>
      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Requesting...' : 'Request visit'}
      </button>
    </form>
  );
}
