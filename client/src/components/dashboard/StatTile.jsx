import { Link } from 'react-router';

// `to` is either a route ("/inquiries") or a section on the same page ("#reviews").
export function StatTile({ label, value, to }) {
  const content = (
    <>
      <strong>{value}</strong>
      <span>{label}</span>
    </>
  );

  if (to.startsWith('#')) {
    return (
      <a href={to} className="stat-tile">
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className="stat-tile">
      {content}
    </Link>
  );
}
