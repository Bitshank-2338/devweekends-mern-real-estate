import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src="/favicon.svg" alt="" width="32" height="32" />
          EstateNest
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="main-menu" className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/properties" onClick={closeMenu}>
            Properties
          </NavLink>
          <NavLink to="/agents" onClick={closeMenu}>
            Agents
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/inquiries" onClick={closeMenu}>
                Inquiries
              </NavLink>
              <NavLink to="/appointments" onClick={closeMenu}>
                Visits
              </NavLink>
              <span className="nav-user">
                {user.name} <span className="role-tag">{user.role}</span>
              </span>
              <button type="button" className="btn btn-small btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-small" onClick={closeMenu}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
