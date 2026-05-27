import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OAQPage.css';

const FAQ_CATEGORIES = [
  'General', 'Registration', 'Program', 'Technical', 'Assignments',
  'Mentorship', 'Certification', 'Placement', 'Funding', 'Schedule',
  'Communication', 'Other',
];

function OAQPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [oaqs, setOaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState([]);
  const [sort, setSort] = useState('trending');
  const [expandedId, setExpandedId] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [related, setRelated] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchOaqs = useCallback(() => {
    setLoading(true);
    fetch(`/api/oaq?sort=${sort}`)
      .then(res => res.json())
      .then(data => { setOaqs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sort]);

  useEffect(() => { fetchOaqs(); }, [fetchOaqs]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setError('');
    setDuplicates([]);
    setSubmitting(true);
    try {
      const res = await authFetch('/api/oaq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion, description: newDescription, category: newCategory }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setDuplicates(data.duplicates || []);
        return;
      }
      if (!res.ok) { setError(data.error); return; }
      setNewQuestion('');
      setNewDescription('');
      setNewCategory('');
      setShowForm(false);
      fetchOaqs();
    } catch { setError('Connection error'); }
    finally { setSubmitting(false); }
  };

  const aiCheckDuplicates = async () => {
    if (!newQuestion.trim() || newQuestion.length < 5) return;
    const res = await fetch('/api/ai/check-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion }),
    });
    if (res.ok) {
      const data = await res.json();
      setDuplicates(data.duplicates || []);
    }
  };

  const fetchRelated = async (question) => {
    const res = await fetch(`/api/ai/related?q=${encodeURIComponent(question)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.faq?.length || data.oaq?.length) setRelated(data);
    }
  };

  const handleVote = async (id, value) => {
    if (!user) return navigate('/login');
    const res = await authFetch(`/api/oaq/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOaqs(prev => prev.map(o => o._id === updated._id ? updated : o));
    }
  };

  const toggleExpand = id => {
    const isOpening = expandedId !== id;
    setExpandedId(prev => prev === id ? null : id);
    setNewAnswer('');
    if (isOpening) {
      fetch(`/api/oaq/${id}/view`, { method: 'POST' }).catch(() => {});
      setOaqs(prev => prev.map(o => o._id === id ? { ...o, views: (o.views || 0) + 1 } : o));
      const oaq = oaqs.find(o => o._id === id);
      if (oaq) fetchRelated(oaq.question);
    } else {
      setRelated(null);
    }
  };

  const submitAnswer = async (oaqId) => {
    if (!user) return navigate('/login');
    if (!newAnswer.trim()) return;
    const res = await authFetch(`/api/oaq/${oaqId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newAnswer }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOaqs(prev => prev.map(o => o._id === updated._id ? updated : o));
      setNewAnswer('');
    }
  };

  const handleAnswerVote = async (oaqId, answerId, value) => {
    if (!user) return navigate('/login');
    const res = await authFetch(`/api/oaq/${oaqId}/answers/${answerId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOaqs(prev => prev.map(o => o._id === updated._id ? updated : o));
    }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getScore = o => (o.upvotes || 0) * 3 + (o.views || 0) * 0.5 + (o.answers?.length || 0) * 2;

  const sortedOaqs = [...oaqs].sort((a, b) => {
    if (sort === 'trending') return getScore(b) - getScore(a);
    if (sort === 'votes') return (b.upvotes || 0) - (a.upvotes || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="oaq-page">
      <div className="oaq-container">
        <div className="oaq-header">
          <h1 className="oaq-title">Community Q&A</h1>
          <p className="oaq-subtitle">Ask questions, get answers from the community, and vote on the best responses.</p>
        </div>

        {/* Submit question */}
        <div className="oaq-submit-card">
          <div className="oaq-submit-header">
            <h2>Ask a question</h2>
            {!showForm && <button className="oaq-btn oaq-btn--primary" onClick={() => setShowForm(true)}>+ New question</button>}
            {showForm && <button className="oaq-btn oaq-btn--ghost" onClick={() => { setShowForm(false); setDuplicates([]); setError(''); }}>Cancel</button>}
          </div>
          {showForm && (
            <form onSubmit={handleSubmit}>
              <textarea
                className="oaq-textarea"
                placeholder="What do you need help with? Be specific..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                rows={3}
                onBlur={aiCheckDuplicates}
              />
              <textarea
                className="oaq-textarea oaq-textarea--sm"
                placeholder="Add more details (optional)"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={2}
                style={{ marginTop: 8 }}
              />
              <div className="oaq-category-row">
                <select
                  className="oaq-select"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="">Select category (optional)</option>
                  {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {error && <div className="oaq-error">{error}</div>}
              {duplicates.length > 0 && (
                <div className="oaq-duplicates">
                  <strong>AI detected similar questions:</strong>
                  <ul>
                    {duplicates.map((d, i) => (
                      <li key={i}>
                        {d.source === 'FAQ' ? '📖 FAQ: ' : '💬 OAQ: '}
                        {d.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="oaq-btn oaq-btn--primary" type="submit" disabled={submitting || !newQuestion.trim()}>
                {submitting ? 'Submitting…' : 'Submit question'}
              </button>
            </form>
          )}
        </div>

        {/* Sort */}
        <div className="oaq-toolbar">
          <span className="oaq-count">{oaqs.length} question{oaqs.length !== 1 ? 's' : ''}</span>
          <div className="oaq-sort">
            <button className={`oaq-sort-btn ${sort === 'trending' ? 'active' : ''}`} onClick={() => setSort('trending')}>Trending</button>
            <button className={`oaq-sort-btn ${sort === 'newest' ? 'active' : ''}`} onClick={() => setSort('newest')}>Newest</button>
            <button className={`oaq-sort-btn ${sort === 'votes' ? 'active' : ''}`} onClick={() => setSort('votes')}>Top voted</button>
          </div>
        </div>

        {/* OAQ list */}
        {loading ? (
          <div className="oaq-loader">Loading…</div>
        ) : oaqs.length === 0 ? (
          <div className="oaq-empty">No questions yet. Be the first to ask!</div>
        ) : (
          <div className="oaq-list">
            {sortedOaqs.map(oaq => (
              <div key={oaq._id} className={`oaq-card ${oaq.status === 'approved' ? 'oaq-card--approved' : ''} ${oaq.status === 'promoted' ? 'oaq-card--promoted' : ''}`}>
                <div className="oaq-card__vote">
                  <button className="oaq-vote-btn oaq-vote-btn--up" onClick={() => handleVote(oaq._id, 1)} title="Upvote">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <span className="oaq-vote-split">
                    <span className="oaq-vote-up">{oaq.upvotes}</span>
                    <span className="oaq-vote-down">{oaq.downvotes}</span>
                  </span>
                  <button className="oaq-vote-btn oaq-vote-btn--down" onClick={() => handleVote(oaq._id, -1)} title="Downvote">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
                <div className="oaq-card__body">
                  <div className="oaq-card__top">
                    <h3 className="oaq-card__question">{oaq.question}</h3>
                    <span className={`oaq-status oaq-status--${oaq.status}`}>{oaq.status}</span>
                  </div>
                  {oaq.description && <p className="oaq-card__desc">{oaq.description}</p>}
                  {oaq.category && <span className="oaq-card__cat">{oaq.category}</span>}
                  <div className="oaq-card__meta">
                    <span>{oaq.submittedBy?.name || 'Anonymous'}</span>
                    <span>{formatDate(oaq.createdAt)}</span>
                    <span>{oaq.views || 0} view{(oaq.views || 0) !== 1 ? 's' : ''}</span>
                    <span>{oaq.answers.length} answer{oaq.answers.length !== 1 ? 's' : ''}</span>
                    <span className="oaq-card__score">Score: {getScore(oaq).toFixed(0)}</span>
                  </div>
                  <button className="oaq-card__expand" onClick={() => toggleExpand(oaq._id)}>
                    {expandedId === oaq._id ? 'Hide answers' : `View ${oaq.answers.length} answer${oaq.answers.length !== 1 ? 's' : ''}`}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`oaq-chevron ${expandedId === oaq._id ? 'open' : ''}`}>
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  {expandedId === oaq._id && (
                    <div className="oaq-answers">
                      {oaq.answers.length === 0 && <p className="oaq-answers__empty">No answers yet. Be the first to respond!</p>}
                      {oaq.answers.map(ans => (
                        <div key={ans._id} className={`oaq-answer ${ans.accepted ? 'oaq-answer--accepted' : ''}`}>
                          <div className="oaq-answer__vote">
                            <button className="oaq-vote-btn oaq-vote-btn--sm oaq-vote-btn--up" onClick={() => handleAnswerVote(oaq._id, ans._id, 1)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                            </button>
                            <span className="oaq-vote-split oaq-vote-split--sm">
                              <span className="oaq-vote-up">{ans.upvotes}</span>
                              <span className="oaq-vote-down">{ans.downvotes}</span>
                            </span>
                            <button className="oaq-vote-btn oaq-vote-btn--sm oaq-vote-btn--down" onClick={() => handleAnswerVote(oaq._id, ans._id, -1)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                          </div>
                          <div className="oaq-answer__body">
                            <p>{ans.text}</p>
                            <div className="oaq-answer__meta">
                              <span>{ans.submittedBy?.name || 'Anonymous'}</span>
                              <span>{formatDate(ans.createdAt)}</span>
                              {ans.accepted && <span className="oaq-answer__accepted-badge">✓ Accepted</span>}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Related questions */}
                      {related && (
                        <div className="oaq-related">
                          <strong>Related questions:</strong>
                          {related.faq?.length > 0 && related.faq.map(cat => cat.questions.map((item, i) => (
                            <div key={i} className="oaq-related-item" onClick={() => navigate('/faq')}>
                              📖 {item.q}
                            </div>
                          )))}
                          {related.oaq?.length > 0 && related.oaq.map(o => (
                            <div key={o._id} className="oaq-related-item" onClick={() => { setExpandedId(o._id); fetchRelated(o.question); }}>
                              💬 {o.question}
                            </div>
                          ))}
                        </div>
                      )}

                      {oaq.status !== 'promoted' && oaq.status !== 'rejected' && (
                        <div className="oaq-answer-form">
                          <textarea
                            className="oaq-textarea oaq-textarea--sm"
                            placeholder="Write your answer…"
                            value={newAnswer}
                            onChange={e => setNewAnswer(e.target.value)}
                            rows={2}
                          />
                          <button className="oaq-btn oaq-btn--secondary" onClick={() => submitAnswer(oaq._id)} disabled={!newAnswer.trim()}>
                            Post answer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OAQPage;
