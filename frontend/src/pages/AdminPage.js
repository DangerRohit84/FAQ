import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'approved', label: 'Approved' },
  { key: 'promoted', label: 'Promoted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'reports', label: 'Reports' },
];

function AdminPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [oaqs, setOaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [editAnswer, setEditAnswer] = useState(null);
  const [editText, setEditText] = useState('');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(null);
  const [aiResult, setAiResult] = useState({});

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
    if (!user) navigate('/login');
  }, [user]);

  const fetchOaqs = useCallback(() => {
    if (activeTab === 'reports') {
      setReportsLoading(true);
      fetch('/api/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => { setReports(data); setReportsLoading(false); })
        .catch(() => setReportsLoading(false));
      return;
    }
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

  const handleAcceptAnswer = async (oaqId, answerId) => {
    const res = await authFetch(`/api/oaq/${oaqId}/answers/${answerId}/accept`, { method: 'PUT' });
    if (res.ok) fetchOaqs();
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const canPromote = oaq => oaq.netVotes >= 10;

  const handleReportAction = async (id, action) => {
    const res = await fetch(`/api/reports/${id}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ action }),
    });
    if (res.ok) fetchOaqs();
  };

  const handleDeleteReported = async id => {
    const res = await fetch(`/api/reports/${id}/content`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (res.ok) fetchOaqs();
  };

  const handleAiSummarize = async oaqId => {
    setAiLoading(oaqId);
    setAiResult(prev => ({ ...prev, [oaqId]: null }));
    try {
      const res = await fetch(`/api/ai/summarize/${oaqId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(prev => ({ ...prev, [oaqId]: data }));
      } else {
        const err = await res.json();
        setAiResult(prev => ({ ...prev, [oaqId]: { error: err.error || 'Failed' } }));
      }
    } catch {
      setAiResult(prev => ({ ...prev, [oaqId]: { error: 'Request failed' } }));
    }
    setAiLoading(null);
  };

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

        {activeTab === 'reports' ? (
          reportsLoading ? (
            <div className="admin-loader">Loading reports…</div>
          ) : reports.length === 0 ? (
            <div className="admin-empty">No reports.</div>
          ) : (
            <div className="admin-list">
              {reports.map(r => (
                <div key={r._id} className="admin-card">
                  <div className="admin-card__header">
                    <span className={`admin-report-status admin-report-status--${r.status}`}>{r.status}</span>
                    <span className="admin-report-type">{r.targetType}</span>
                    <div className="admin-card__actions">
                      {r.status === 'pending' && (
                        <>
                          <button className="admin-btn admin-btn--approve" onClick={() => handleReportAction(r._id, 'resolved')}>Resolve</button>
                          <button className="admin-btn admin-btn--reject" onClick={() => handleReportAction(r._id, 'dismissed')}>Dismiss</button>
                          <button className="admin-btn admin-btn--danger" onClick={() => handleDeleteReported(r._id)}>Delete content</button>
                        </>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '8px 0' }}>"{r.reason}"</p>
                  <div className="admin-card__meta">
                    <span>Reported by {r.reportedBy?.name || 'Unknown'}</span>
                    <span>{formatDate(r.createdAt)}</span>
                    {r.resolvedBy && <span>Resolved by {r.resolvedBy.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
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
                    {oaq.answers.length > 0 && (
                      <button
                        className="admin-btn admin-btn--ai"
                        onClick={() => handleAiSummarize(oaq._id)}
                        disabled={aiLoading === oaq._id}
                      >
                        {aiLoading === oaq._id ? 'Analyzing…' : 'AI Summarize'}
                      </button>
                    )}
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
                        <button className="admin-btn admin-btn--promote" onClick={() => handlePromote(oaq._id)}>
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
                              {ans.accepted && <span className="admin-accepted-badge">✓ Accepted</span>}
                              <button className="admin-btn--text" onClick={() => handleAcceptAnswer(oaq._id, ans._id)}>
                                {ans.accepted ? 'Unaccept' : 'Accept'}
                              </button>
                              <button className="admin-btn--text" onClick={() => { setEditAnswer(ans._id); setEditText(ans.text); }}>Edit</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {aiResult[oaq._id] && (
                  <div className="admin-ai-result">
                    {aiResult[oaq._id].error ? (
                      <p className="admin-ai-error">{aiResult[oaq._id].error}</p>
                    ) : (
                      <>
                        <div className="admin-ai-header">AI Analysis</div>
                        <p className="admin-ai-text">{aiResult[oaq._id].summary}</p>
                        {aiResult[oaq._id].bestAnswerIndex >= 0 && (
                          <p className="admin-ai-best">
                            Best answer: <strong>#{aiResult[oaq._id].bestAnswerIndex + 1}</strong>
                            {aiResult[oaq._id].reason && <span> — {aiResult[oaq._id].reason}</span>}
                          </p>
                        )}
                      </>
                    )}
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
