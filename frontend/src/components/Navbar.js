import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(p => !p);
  const closeMenu = () => setIsOpen(false);
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
        <div className="navbar-brand-wrapper">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>FAQ Portal</span>
          </Link>
          <Link to="/" className="navbar-brand-home" onClick={closeMenu}>Home</Link>
        </div>
        <div className="navbar-links">
          {user?.role === 'admin' && (
            <>
              <Link to="/faq" className="navbar-link">FAQ</Link>
              <Link to="/admin" className="navbar-link">Admin</Link>
            </>
          )}
          {user ? (
            <>
              {user.role === 'admin' && <button className="navbar-btn" onClick={() => { logout(); navigate('/'); }}>Sign out</button>}
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>

        {/* Persistent Utilities & Hamburger Controls */}
        <div className="navbar-right">
          {user && <span className={`navbar-role navbar-role--${user.role}`}>{user.role}</span>}
          <NotificationBell />
          <div className="navbar-lamp">
            <ThemeToggle />
          </div>
          
          {/* Hamburger Icon Element (Displays to the right of indicators on mobile views) */}
          <div className="hamburger" onClick={toggleMenu}>
            <div className={`bar ${isOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isOpen ? 'open' : ''}`}></div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;