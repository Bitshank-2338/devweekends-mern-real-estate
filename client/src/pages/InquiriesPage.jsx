import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDate } from '../utils/format';
import { INQUIRY_STATUSES } from '../utils/constants';

// Buyers can edit their message or delete the inquiry.
// Agents can move the status along: new → contacted → closed.
function InquiryItem({ inquiry, role, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(inquiry.message);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function runAction(action) {
    setError('');
    setSaving(true);

    try {
      await action();
      setEditing(false);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setSaving(false);
    }
  }

  const otherPerson = role === 'agent' ? inquiry.buyer : inquiry.agent;

  return (
    <li className="card list-item">
      <div className="list-item-header">
        <div>
          <h3>
            {inquiry.property ? (
              <Link to={`/properties/${inquiry.property._id}`}>{inquiry.property.title}</Link>
            ) : (
              'Removed property'
            )}
          </h3>
          <p className="muted small">
            {role === 'agent' ? 'From' : 'To'} {otherPerson?.name} ({otherPerson?.email}) ·{' '}
            {formatDate(inquiry.createdAt)}
          </p>
        </div>
        <StatusBadge status={inquiry.status} />
      </div>

      <ErrorMessage message={error} />

      {editing ? (
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            runAction(() => onUpdate(inquiry._id, { message }));
          }}
        >
          <textarea
            rows="3"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            maxLength={1000}
            aria-label="Inquiry message"
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-small" disabled={saving}>
              Save
            </button>
            <button type="button" className="btn btn-small btn-outline" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="list-item-message">{inquiry.message}</p>
      )}

      {inquiry.phone && <p className="small">Phone: {inquiry.phone}</p>}

      {role === 'agent' ? (
        <label className="inline-select">
          Status
          <select
            value={inquiry.status}
            disabled={saving}
            onChange={(event) => runAction(() => onUpdate(inquiry._id, { status: event.target.value }))}
          >
            {INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      ) : (
        !editing && (
          <div className="card-actions">
            <button type="button" className="btn btn-small btn-outline" onClick={() => setEditing(true)}>
              Edit message
            </button>
            <button
              type="button"
              className="btn btn-small btn-danger"
              disabled={saving}
              onClick={() => {
                if (window.confirm('Delete this inquiry?')) runAction(() => onDelete(inquiry._id));
              }}
            >
              Delete
            </button>
          </div>
        )
      )}
    </li>
  );
}

export default function InquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get('/api/inquiries');
      setInquiries(data.inquiries);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  async function handleUpdate(inquiryId, changes) {
    const data = await api.put(`/api/inquiries/${inquiryId}`, changes);
    setInquiries((current) =>
      current.map((inquiry) => (inquiry._id === data.inquiry._id ? data.inquiry : inquiry))
    );
  }

  async function handleDelete(inquiryId) {
    await api.delete(`/api/inquiries/${inquiryId}`);
    setInquiries((current) => current.filter((inquiry) => inquiry._id !== inquiryId));
  }

  const visibleInquiries = statusFilter
    ? inquiries.filter((inquiry) => inquiry.status === statusFilter)
    : inquiries;

  return (
    <div className="container page">
      <header className="page-header page-header-row">
        <div>
          <h1>{user.role === 'agent' ? 'Inquiries received' : 'My inquiries'}</h1>
          <p className="muted">
            {user.role === 'agent'
              ? 'Messages from buyers about your listings.'
              : 'Questions you sent to agents.'}
          </p>
        </div>
        <label className="inline-select">
          Show
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            {INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </header>

      {loading && <LoadingState text="Loading inquiries..." />}
      <ErrorMessage message={error} onRetry={loadInquiries} />

      {!loading && !error && visibleInquiries.length === 0 && (
        <div className="empty-state">
          <p className="muted">No inquiries here yet.</p>
          {user.role === 'buyer' && (
            <Link to="/properties" className="btn">
              Browse properties
            </Link>
          )}
        </div>
      )}

      <ul className="item-list">
        {visibleInquiries.map((inquiry) => (
          <InquiryItem
            key={inquiry._id}
            inquiry={inquiry}
            role={user.role}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
