import React, { useState, useEffect } from 'react';
import './LeaderboardPage.css';

const RULES = [
  { action: 'Ask a question', points: '+5' },
  { action: 'Answer a question', points: '+10' },
  { action: 'Receive an upvote', points: '+3' },
  { action: 'Receive a downvote', points: '-2' },
  { action: 'Answer accepted as best', points: '+25' },
  { action: 'Q&A promoted to FAQ', points: '+50' },
];

function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="lb-page">
      <div className="lb-container">
        <div className="lb-header">
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-subtitle">Top contributors ranked by community activity and engagement.</p>
          <button className="lb-rules-toggle" onClick={() => setShowRules(!showRules)}>
            {showRules ? 'Hide' : 'Show'} scoring rules
          </button>
        </div>

        {showRules && (
          <div className="lb-rules">
            <h3>How points are earned</h3>
            <div className="lb-rules-grid">
              {RULES.map((r, i) => (
                <div key={i} className="lb-rule">
                  <span className="lb-rule__action">{r.action}</span>
                  <span className={`lb-rule__points ${r.points.startsWith('+') ? 'positive' : 'negative'}`}>{r.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="lb-loader">Loading…</div>
        ) : users.length === 0 ? (
          <div className="lb-empty">No contributors yet.</div>
        ) : (
          <div className="lb-list">
            {users.map((u, i) => (
              <div key={u._id} className={`lb-card ${i < 3 ? `lb-card--rank-${i + 1}` : ''}`}>
                <div className="lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="lb-avatar">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="lb-info">
                  <div className="lb-name">{u.name}</div>
                  <div className="lb-stats">
                    <span>{u.questionsAsked} asked</span>
                    <span>·</span>
                    <span>{u.answersGiven} answered</span>
                    <span>·</span>
                    <span>{u.acceptedCount} accepted</span>
                    {u.promotedCount > 0 && <><span>·</span><span>{u.promotedCount} promoted</span></>}
                  </div>
                </div>
                <div className="lb-score">{u.score.toLocaleString()} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;
