import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="container page empty-state">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="btn">
        Go home
      </Link>
    </div>
  );
}
