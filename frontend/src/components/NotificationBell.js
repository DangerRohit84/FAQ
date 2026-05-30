import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NotificationBell.css';

function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setUnread(data.unread || 0);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      credentials: 'include',
    });
    setNotifications(n => n.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    setNotifications(n => n.map(not => not._id === id ? { ...not, read: true } : not));
    setUnread(u => Math.max(0, u - 1));
  };

  if (!user) return null;

  const typeIcon = {
    answer: '💬',
    promoted: '⭐',
    accepted: '✅',
    approved: '👍',
    related: '🔗',
    follow_up: '📎',
    system: '🔔',
  };

  return (
    <div className={`notif-bell ${open ? 'notif-bell--open' : ''}`} ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="notif-bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n._id}
                  to={n.link || '#'}
                  className={`notif-item ${n.read ? '' : 'notif-item--unread'}`}
                  onClick={() => { if (!n.read) markRead(n._id); setOpen(false); }}
                >
                  <span className="notif-item-icon">{typeIcon[n.type] || '🔔'}</span>
                  <div className="notif-item-content">
                    <span className="notif-item-text">{n.message}</span>
                    <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default NotificationBell;
