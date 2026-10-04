import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Wraps pages that need a logged-in user. Visitors are sent to /login and
// brought back to the page they wanted after logging in.
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
