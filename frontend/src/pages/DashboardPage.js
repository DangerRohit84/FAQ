import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function DashboardPage() {
  const { user, loading, authFetch, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    authFetch('/api/dashboard')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setStats(data.stats))
      .catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>Welcome, {user.name}</h1>
            <p className="dashboard-email">{user.email}</p>
          </div>
          <div className="dashboard-actions">
            <button className="dashboard-btn dashboard-btn--secondary" onClick={() => navigate('/')}>
              Browse FAQ
            </button>
            <button className="dashboard-btn dashboard-btn--danger" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>

        {stats && (
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                  <path d="M9 10h6M9 6h6M9 14h3" />
                </svg>
              </div>
              <div className="dashboard-stat-card__value">{stats.categories}</div>
              <div className="dashboard-stat-card__label">Categories</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <div className="dashboard-stat-card__value">{stats.questions}</div>
              <div className="dashboard-stat-card__label">Questions</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="dashboard-stat-card__value">{stats.openOaqs}</div>
              <div className="dashboard-stat-card__label">Open Q&A</div>
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <h2>Quick Links</h2>
          <div className="dashboard-links">
            <button className="dashboard-link-card" onClick={() => navigate('/')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span>Browse FAQ</span>
            </button>
            <button className="dashboard-link-card" onClick={() => navigate('/community')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Community Q&A</span>
            </button>
            {user.role === 'admin' && (
              <button className="dashboard-link-card" onClick={() => navigate('/admin')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
