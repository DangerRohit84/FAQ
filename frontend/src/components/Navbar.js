import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  if (isAuthPage && !user) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>FAQ Portal</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span>FAQ Portal</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/faq" className="navbar-link">FAQ</Link>
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/community" className="navbar-link">Community</Link>
              <Link to="/leaderboard" className="navbar-link">Leaderboard</Link>
            </>
          )}
          {user ? (
            <>
              {user.role !== 'admin' && <Link to="/dashboard" className="navbar-link">Dashboard</Link>}
              <span className={`navbar-role navbar-role--${user.role}`}>{user.role}</span>
              <button className="navbar-btn" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Sign in</Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary">Sign up</Link>
            </>
          )}
        </div>
        <div className="navbar-right">
          <NotificationBell />
          <div className="navbar-lamp">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
