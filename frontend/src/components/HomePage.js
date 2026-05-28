import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FAQItem from './FAQItem';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [openItems, setOpenItems] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [listening, setListening] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [flipping, setFlipping] = useState(null);
  const [catOpenItems, setCatOpenItems] = useState({});
  const searchTimer = useRef(null);
  const suggestTimer = useRef(null);
  const searchInputRef = useRef(null);
  const gridRef = useRef(null);
  const recognitionRef = useRef(null);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micSupported = !!SpeechRecognition;

  /* ── Voice search ── */
  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSearchQuery(text);
      setListening(false);
      doSearch(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [listening, SpeechRecognition]);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => { setHomeData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── / hotkey to focus search ── */
  useEffect(() => {
    const handler = e => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const doSearch = useCallback((q) => {
    if (!q.trim()) { setSearchResults(null); return; }
    fetch(`/api/search/all?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        const combined = [];
        for (const cat of (data.faq || [])) {
          for (const item of cat.questions) {
            combined.push({ ...item, _type: 'FAQ', _cat: cat.category, _icon: cat.icon, _catId: cat._id });
          }
        }
        for (const item of (data.oaq || [])) {
          combined.push({ ...item, _type: 'OAQ' });
        }
        setSearchResults(combined);
        setSuggestions([]);
      })
      .catch(() => setSearchResults([]));
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, doSearch]);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!searchQuery.trim() || searchQuery.length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 150);
    return () => clearTimeout(suggestTimer.current);
  }, [searchQuery]);

  const toggleItem = useCallback((idx) => {
    setOpenItems(prev => ({ ...prev, [idx]: prev[idx] === undefined ? 0 : prev[idx] === 0 ? null : 0 }));
  }, []);

  const handleView = useCallback((catId, qId) => {
    const idx = (searchResults || []).findIndex(
      i => i._type === 'FAQ' && i._catId === catId && i._id === qId
    );
    if (idx >= 0) {
      setSearchResults(prev => prev.map((item, i) =>
        i === idx ? { ...item, views: (item.views || 0) + 1 } : item
      ));
    }
  }, [searchResults]);

  const quickFilters = [
    { key: 'all', label: 'All' },
    { key: 'trending', label: 'Trending' },
    { key: 'open', label: 'Open' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const showTrending = activeTab === 'all' || activeTab === 'trending';
  const showLatest = activeTab === 'all';
  const showOpenOnly = activeTab === 'open';
  const showResolvedOnly = activeTab === 'resolved';

  const filteredTrending = (!searchResults && homeData?.trending?.filter(o => {
    if (showOpenOnly) return o.status === 'open';
    if (showResolvedOnly) return o.status === 'approved' || o.status === 'promoted';
    return true;
  }) || []);

  const filteredLatest = (!searchResults && homeData?.latest?.filter(o => {
    if (showOpenOnly) return o.status === 'open';
    if (showResolvedOnly) return o.status === 'approved' || o.status === 'promoted';
    return true;
  }) || []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-container"><div className="home-loader" /></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-gradient" />

      <div className="home-container">
        {/* Hero / Search */}
        <div className="home-hero">
          <span className="home-badge">Vicharanashala Help Center</span>
          <h1 className="home-title">How can we help you?</h1>
          <p className="home-subtitle">Search our knowledge base, ask the community, or browse categories below.</p>

          <div className="home-search-wrapper">
            <div className="home-search">
              <svg className="home-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="home-search-input"
                placeholder="Search questions, keywords, or topics...  (press / to focus)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && fetch(`/api/search/suggest?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()).then(setSuggestions).catch(() => {})}
              />
              {micSupported && (
                <button
                  className={`home-search-mic ${listening ? 'home-search-mic--active' : ''}`}
                  onClick={toggleListening}
                  title={listening ? 'Stop listening' : 'Search by voice'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              )}
              {searchQuery && (
                <button className="home-search-clear" onClick={() => { setSearchQuery(''); setSearchResults(null); setSuggestions([]); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <button className="home-ask-btn" onClick={() => navigate('/community')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New question
            </button>
            {suggestions.length > 0 && (
              <div className="home-suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="home-suggestion" onClick={() => { setSearchQuery(s.text); setSuggestions([]); doSearch(s.text); }}>
                    <span className="home-suggestion__badge">{s.type === 'FAQ' ? '📖' : '💬'}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="home-quick-filters">
            <span className="home-filter-label">Quick filters:</span>
            {quickFilters.map(f => (
              <button
                key={f.key}
                className={`home-filter-pill ${activeTab === f.key ? 'active' : ''}`}
                onClick={() => setActiveTab(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search results */}
        {searchResults !== null && (
          <div className="home-results">
            <div className="home-results-header">
              <span className="home-results-count">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
              <button className="home-results-clear" onClick={() => { setSearchQuery(''); setSearchResults(null); }}>Clear</button>
            </div>
            {searchResults.length === 0 ? (
              <div className="home-results-empty">
                <h3>No results found</h3>
                <p>Try different keywords or ask the community.</p>
                <button className="home-cta-btn" onClick={() => navigate('/community')}>Ask the Community →</button>
              </div>
            ) : (
              <div className="home-results-list">
                {searchResults.map((item, i) => (
                  item._type === 'FAQ' ? (
                    <FAQItem
                      key={i}
                      number={i + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItems[i] === 0}
                      onToggle={() => toggleItem(i)}
                      catId={item._catId}
                      qId={item._id}
                      views={item.views}
                      onView={() => handleView(item._catId, item._id)}
                    />
                  ) : (
                    <div key={i} className="home-result-oaq" onClick={() => navigate('/community')}>
                      <div className="home-result-oaq__badge">💬 Community</div>
                      <div className="home-result-oaq__question">{item.question}</div>
                      <div className="home-result-oaq__meta">{item.upvotes} votes · {item.views} views · {item.answers?.length || 0} answers</div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category cards */}
        {!searchResults && homeData?.categoryCards && (
          <div className="home-section">
            <h2 className="home-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="home-section-icon">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                <path d="M9 10h6M9 6h6M9 14h3" />
              </svg>
              Browse by Category
            </h2>
            <div className="home-category-grid" ref={gridRef}>
              {homeData.categoryCards.map((cat, i) => (
                <div
                  key={cat._id}
                  className={`home-category-card ${flipping === cat._id ? 'home-category-card--flip' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => {
                    setFlipping(cat._id);
                    setTimeout(() => {
                      setFlipping(null);
                      setSelectedCat(cat);
                    }, 300);
                  }}
                >
                  <div className="home-category-card__icon">{cat.icon}</div>
                  <div className="home-category-card__name">{cat.category}</div>
                  <div className="home-category-card__count">{cat.count} question{cat.count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {showTrending && !searchResults && filteredTrending.length > 0 && (
          <div className="home-section">
            <h2 className="home-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="home-section-icon">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              Trending Questions
            </h2>
            <div className="home-trending-list">
              {filteredTrending.map((o, i) => (
                <div key={o._id} className="home-trending-item" onClick={() => navigate('/community')}>
                  <span className="home-trending-item__rank">#{i + 1}</span>
                  <div className="home-trending-item__body">
                    <div className="home-trending-item__q">{o.question}</div>
                    <div className="home-trending-item__meta">
                      <span className="home-trending-item__votes">↑ {o.upvotes || 0}</span>
                      <span>{o.views || 0} views</span>
                      <span>{o.answers?.length || 0} answers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest discussions */}
        {showLatest && !searchResults && filteredLatest.length > 0 && (
          <div className="home-section">
            <h2 className="home-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="home-section-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Latest Discussions
            </h2>
            <div className="home-latest-list">
              {filteredLatest.map(o => (
                <div key={o._id} className="home-latest-item" onClick={() => navigate('/community')}>
                  <div className="home-latest-item__q">{o.question}</div>
                  <div className="home-latest-item__meta">
                    <span>{o.submittedBy?.name || 'Anonymous'}</span>
                    <span>·</span>
                    <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span>·</span>
                    <span className={`home-status home-status--${o.status}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category modal */}
        {selectedCat && (
          <div className="home-cat-overlay" onClick={() => { setSelectedCat(null); setCatOpenItems({}); }}>
            <div className="home-cat-modal" onClick={e => e.stopPropagation()}>
              <button className="home-cat-close" onClick={() => { setSelectedCat(null); setCatOpenItems({}); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <div className="home-cat-modal__header">
                <span className="home-cat-modal__icon">{selectedCat.icon}</span>
                <h2 className="home-cat-modal__title">{selectedCat.category}</h2>
                <span className="home-cat-modal__count">{selectedCat.count} question{selectedCat.count !== 1 ? 's' : ''}</span>
              </div>
              <div className="home-cat-modal__body">
                {!selectedCat.questions || selectedCat.questions.length === 0 ? (
                  <p className="home-cat-modal__empty">No questions in this category yet.</p>
                ) : (
                  <div className="home-cat-questions">
                    {selectedCat.questions.map((item, idx) => (
                      <FAQItem
                        key={item._id}
                        number={idx + 1}
                        question={item.q}
                        answer={item.a}
                        views={item.views || 0}
                        catId={selectedCat._id}
                        qId={item._id}
                        isOpen={!!catOpenItems[item._id]}
                        onToggle={() => setCatOpenItems(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                        onView={() => {
                          setSelectedCat(prev => {
                            if (!prev) return prev;
                            const updated = { ...prev, questions: prev.questions.map(q => q._id === item._id ? { ...q, views: (q.views || 0) + 1 } : q) };
                            return updated;
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="home-cat-modal__footer">
                <button className="home-cat-modal__btn" onClick={() => { setSelectedCat(null); setCatOpenItems({}); navigate('/faq'); }}>
                  View all in FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats footer */}
        {homeData?.stats && (
          <div className="home-stats-bar">
            <div className="home-stat">
              <span className="home-stat__value">{homeData.stats.categories}</span>
              <span className="home-stat__label">Categories</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{homeData.stats.questions}</span>
              <span className="home-stat__label">Questions</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{homeData.stats.openOaqs}</span>
              <span className="home-stat__label">Open Q&A</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">{homeData.stats.promotedCount}</span>
              <span className="home-stat__label">Promoted to FAQ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
