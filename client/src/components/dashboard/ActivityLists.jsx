import { Link } from 'react-router';
import { StatusBadge } from '../StatusBadge';
import { formatDate } from '../../utils/format';

const PREVIEW_COUNT = 3;

// Short previews for the dashboards. The full lists live on the
// Inquiries and Visits pages. `role` decides whose name is shown.
export function InquiryPreviewList({ inquiries, role }) {
  if (inquiries.length === 0) return <p className="muted">No inquiries yet.</p>;

  return (
    <ul className="activity-list">
      {inquiries.slice(0, PREVIEW_COUNT).map((inquiry) => (
        <li key={inquiry._id}>
          <div>
            <strong>{inquiry.property?.title || 'Removed property'}</strong>
            <p className="muted small">
              {role === 'agent' ? `From ${inquiry.buyer?.name}` : `To ${inquiry.agent?.name}`} ·{' '}
              {formatDate(inquiry.createdAt)}
            </p>
          </div>
          <StatusBadge status={inquiry.status} />
        </li>
      ))}
      <li className="activity-more">
        <Link to="/inquiries">See all inquiries →</Link>
      </li>
    </ul>
  );
}

export function AppointmentPreviewList({ appointments, role }) {
  if (appointments.length === 0) return <p className="muted">No upcoming visits.</p>;

  return (
    <ul className="activity-list">
      {appointments.slice(0, PREVIEW_COUNT).map((appointment) => (
        <li key={appointment._id}>
          <div>
            <strong>{appointment.property?.title || 'Removed property'}</strong>
            <p className="muted small">
              {formatDate(appointment.date)} at {appointment.time}
              {role === 'agent' && ` · ${appointment.buyer?.name}`}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </li>
      ))}
      <li className="activity-more">
        <Link to="/appointments">See all visits →</Link>
      </li>
    </ul>
  );
}
