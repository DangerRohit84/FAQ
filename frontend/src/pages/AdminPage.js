import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'approved', label: 'Approved' },
  { key: 'promoted', label: 'Promoted' },
  { key: 'rejected', label: 'Rejected' },
];

function AdminPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [oaqs, setOaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [editAnswer, setEditAnswer] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
    if (!user) navigate('/login');
  }, [user]);

  const fetchOaqs = useCallback(() => {
    setLoading(true);
    fetch(`/api/oaq?status=${activeTab}`)
      .then(res => res.json())
      .then(data => { setOaqs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => { if (user?.role === 'admin') fetchOaqs(); }, [fetchOaqs, user]);

  const handleApprove = async id => {
    const res = await authFetch(`/api/oaq/${id}/approve`, { method: 'PUT' });
    if (res.ok) fetchOaqs();
  };

  const handleReject = async id => {
    const res = await authFetch(`/api/oaq/${id}/reject`, { method: 'PUT' });
    if (res.ok) fetchOaqs();
  };

  const handlePromote = async id => {
    const res = await authFetch(`/api/oaq/${id}/promote`, { method: 'PUT' });
    if (res.ok) fetchOaqs();
  };

  const handleEditAnswer = async (oaqId, answerId) => {
    if (!editText.trim()) return;
    const res = await authFetch(`/api/oaq/${oaqId}/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText }),
    });
    if (res.ok) { setEditAnswer(null); setEditText(''); fetchOaqs(); }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const canPromote = oaq => oaq.netVotes >= 10;

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Moderate questions, approve answers, and promote content to FAQ.</p>
        </div>

        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loader">Loading…</div>
        ) : oaqs.length === 0 ? (
          <div className="admin-empty">No {activeTab} questions.</div>
        ) : (
          <div className="admin-list">
            {oaqs.map(oaq => (
              <div key={oaq._id} className="admin-card">
                <div className="admin-card__header">
                  <div className="admin-card__votes">
                    <span className="admin-vote-count">
                      {oaq.upvotes}↑ {oaq.downvotes}↓
                    </span>
                    {oaq.answers.length > 0 && <span className="admin-answer-count">{oaq.answers.length} answers</span>}
                  </div>
                  <div className="admin-card__actions">
                    {activeTab === 'open' && (
                      <>
                        <button className="admin-btn admin-btn--approve" onClick={() => handleApprove(oaq._id)}>Approve</button>
                        <button className="admin-btn admin-btn--reject" onClick={() => handleReject(oaq._id)}>Reject</button>
                      </>
                    )}
                    {activeTab === 'approved' && (
                      <>
                        <button
                          className={`admin-btn admin-btn--promote ${!canPromote(oaq) ? 'disabled' : ''}`}
                          onClick={() => canPromote(oaq) && handlePromote(oaq._id)}
                          title={!canPromote(oaq) ? 'Needs 10+ votes to promote' : 'Promote to FAQ'}
                        >
                          Promote to FAQ
                        </button>
                        <button className="admin-btn admin-btn--reject" onClick={() => handleReject(oaq._id)}>Reject</button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="admin-card__question">{oaq.question}</h3>
                <div className="admin-card__meta">
                  <span>by {oaq.submittedBy?.name || 'Anonymous'}</span>
                  <span>{formatDate(oaq.createdAt)}</span>
                  {!canPromote(oaq) && activeTab === 'approved' && (
                    <span className="admin-hint">Needs {10 - oaq.netVotes} more votes to promote</span>
                  )}
                </div>

                {oaq.answers.length > 0 && (
                  <div className="admin-answers">
                    {oaq.answers.map(ans => (
                      <div key={ans._id} className="admin-answer">
                        {editAnswer === ans._id ? (
                          <div className="admin-edit-form">
                            <textarea
                              className="admin-edit-textarea"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={3}
                            />
                            <div className="admin-edit-actions">
                              <button className="admin-btn admin-btn--approve" onClick={() => handleEditAnswer(oaq._id, ans._id)}>Save</button>
                              <button className="admin-btn admin-btn--reject" onClick={() => { setEditAnswer(null); setEditText(''); }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-answer__body">
                            <p>{ans.text}</p>
                            <div className="admin-answer__meta">
                              <span>by {ans.submittedBy?.name || 'Anonymous'}</span>
                              <span>{formatDate(ans.createdAt)}</span>
                              <span>{ans.upvotes}↑ {ans.downvotes}↓</span>
                              <button className="admin-btn--text" onClick={() => { setEditAnswer(ans._id); setEditText(ans.text); }}>Edit</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
