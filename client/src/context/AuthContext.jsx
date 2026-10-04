import { createContext, useContext, useEffect, useState } from 'react';
import { api, SESSION_EXPIRED_EVENT } from '../api/api';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// Holds the logged-in user for the whole app. The JWT itself lives in
// localStorage so it survives a page refresh; api.js reads it from there.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [sessionExpired, setSessionExpired] = useState(false);

  // On first load, ask the server whether the saved token is still valid.
  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    async function confirmSession() {
      try {
        const data = await api.get('/api/auth/me');
        setUser(data.user);
      } catch {
        // A 401 is handled by the session-expired listener below.
        // Any other error (server asleep) keeps the saved session.
      }
    }

    confirmSession();
  }, []);

  // api.js fires this event when a request comes back 401 with a token.
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setSessionExpired(true);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  function saveSession({ user: loggedInUser, token }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setSessionExpired(false);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, sessionExpired, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
