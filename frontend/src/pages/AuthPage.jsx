import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage() {
  const { user, login } = useAuth();
  const [roleTab, setRoleTab] = useState('student');
  const [studentTab, setStudentTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/faq" replace />;
  }

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (roleTab === 'admin' && data.user.role !== 'admin') {
        setError('This account is not an admin. Use the Student section.');
        return;
      }
      if (roleTab === 'student' && data.user.role !== 'student') {
        setError('This account is not a student. Use the Admin section.');
        return;
      }
      login(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/faq');
      }
    } catch { setError('Connection error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.user);
      navigate('/faq');
    } catch { setError('Connection error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const switchRole = (r) => {
    setRoleTab(r);
    clearForm();
  };

  return (
    <div className="authpage">
      <div className="authpage-card">
        <div className="authpage-header">
          <h1 className="authpage-title">FAQ Portal</h1>
          <p className="authpage-subtitle">Vicharanashala Internship</p>
        </div>

        <div className="authpage-tabs">
          <button
            className={`authpage-tab ${roleTab === 'student' ? 'authpage-tab--active' : ''}`}
            onClick={() => switchRole('student')}
          >
            Student
          </button>
          <button
            className={`authpage-tab ${roleTab === 'admin' ? 'authpage-tab--active' : ''}`}
            onClick={() => switchRole('admin')}
          >
            Admin
          </button>
        </div>

        {roleTab === 'student' && (
          <div className="authpage-subtabs">
            <button
              className={`authpage-subtab ${studentTab === 'signin' ? 'authpage-subtab--active' : ''}`}
              onClick={() => { setStudentTab('signin'); clearForm(); }}
            >
              Sign In
            </button>
            <button
              className={`authpage-subtab ${studentTab === 'signup' ? 'authpage-subtab--active' : ''}`}
              onClick={() => { setStudentTab('signup'); clearForm(); }}
            >
              Create Account
            </button>
          </div>
        )}

        {error && <div className="authpage-error">{error}</div>}

        {roleTab === 'admin' ? (
          <form className="authpage-form" onSubmit={handleSignIn}>
            <div className="authpage-field">
              <label htmlFor="ap-email-admin">Admin Email</label>
              <input
                id="ap-email-admin"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@faq.com"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-password-admin">Password</label>
              <input
                id="ap-password-admin"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="authpage-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
        ) : studentTab === 'signin' ? (
          <form className="authpage-form" onSubmit={handleSignIn}>
            <div className="authpage-field">
              <label htmlFor="ap-email">Student Email</label>
              <input
                id="ap-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-password">Password</label>
              <input
                id="ap-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="authpage-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="authpage-form" onSubmit={handleSignUp}>
            <div className="authpage-field">
              <label htmlFor="ap-name">Full name</label>
              <input
                id="ap-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-email2">Student Email</label>
              <input
                id="ap-email2"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-password2">Password</label>
              <input
                id="ap-password2"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <button className="authpage-btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
