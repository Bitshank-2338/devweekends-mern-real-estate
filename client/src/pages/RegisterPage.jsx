import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';

const ROLE_OPTIONS = [
  { value: 'buyer', label: 'Buyer / renter', hint: 'Browse, contact agents, book visits' },
  { value: 'agent', label: 'Agent', hint: 'List properties and manage leads' },
];

export default function RegisterPage() {
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'agent' ? 'agent' : 'buyer',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (values.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      const data = await api.post('/api/auth/register', values);
      saveSession(data);
      navigate('/dashboard', { replace: true });
    } catch (registerError) {
      setError(registerError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card form auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="muted">It takes less than a minute.</p>

        <ErrorMessage message={error} />

        <fieldset className="role-picker">
          <legend>I am a</legend>
          {ROLE_OPTIONS.map((option) => (
            <label key={option.value} className={values.role === option.value ? 'selected' : ''}>
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={values.role === option.value}
                onChange={handleChange}
              />
              <strong>{option.label}</strong>
              <span className="muted small">{option.hint}</span>
            </label>
          ))}
        </fieldset>

        <label>
          Full name
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            autoComplete="name"
            required
            maxLength={60}
          />
        </label>
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
          Password <span className="muted small">(at least 6 characters)</span>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>

        <button type="submit" className="btn btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="muted small center">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
