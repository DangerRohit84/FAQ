import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/community" className="navbar-link">Community</Link>
          <Link to="/leaderboard" className="navbar-link">Leaderboard</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" className="navbar-link">Admin</Link>}
              <button className="navbar-btn" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Sign in</Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
