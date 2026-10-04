import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';

export default function LoginPage() {
  const { user, sessionExpired, saveSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // After logging in, go back to the page that sent us here (or the dashboard).
  const redirectTo = location.state?.from || '/dashboard';

  if (user) return <Navigate to={redirectTo} replace />;

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await api.post('/api/auth/login', values);
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card form auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your inquiries, visits and listings.</p>

        {sessionExpired && !error && (
          <p className="info-message" role="status">
            Your session expired. Please log in again.
          </p>
        )}
        <ErrorMessage message={error} />

        <label>
          Email
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="btn btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="muted small center">
          New to EstateNest? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
