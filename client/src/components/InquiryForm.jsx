import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/api';
import { ErrorMessage } from './ErrorMessage';

export function InquiryForm({ property }) {
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${property.title}. Is it still available?`
  );
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/api/inquiries', {
        property: property._id,
        message,
        // Phone is optional, so send nothing rather than an empty string.
        phone: phone.trim() || undefined,
      });
      setSent(true);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="success-message" role="status">
        Your inquiry was sent to the agent. Track replies on your{' '}
        <Link to="/inquiries">Inquiries</Link> page.
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      <label>
        Message
        <textarea
          rows="4"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          maxLength={1000}
        />
      </label>
      <label>
        Phone <span className="muted small">(optional)</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+91 98765 43210"
        />
      </label>
      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send inquiry'}
      </button>
    </form>
  );
}
