import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FAQItem from './FAQItem';
import AutocorrectInput from './AutocorrectInput';
import './FAQPage.css';

function FAQPage() {
  const navigate = useNavigate();
  const [faqData, setFaqData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [openItems, setOpenItems] = useState({});
  const searchTimer = useRef(null);
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
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        setFaqData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    searchTimer.current = setTimeout(() => {
      fetch(`/api/faqs/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const displayedData = searchResults ?? faqData;
  const isSearching = searchResults !== null;

  const toggleItem = useCallback((catIndex, qIndex) => {
    setOpenItems(prev => ({
      ...prev,
      [catIndex]: prev[catIndex] === qIndex ? null : qIndex,
    }));
  }, []);

  const handleView = useCallback((catIdx, qIdx) => {
    if (searchResults !== null) {
      setSearchResults(prev => prev ? prev.map((cat, i) =>
        i === catIdx ? { ...cat, questions: cat.questions.map((q, j) =>
          j === qIdx ? { ...q, views: (q.views || 0) + 1 } : q
        ) } : cat
      ) : prev);
    } else {
      setFaqData(prev => prev.map((cat, i) =>
        i === catIdx ? { ...cat, questions: cat.questions.map((q, j) =>
          j === qIdx ? { ...q, views: (q.views || 0) + 1 } : q
        ) } : cat
      ));
    }
  }, [searchResults]);

  if (loading) {
    return (
      <div className="faq-page">
        <div className="faq-container">
          <div className="faq-loader">
            <div className="faq-loader__bar" />
            <div className="faq-loader__cards">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="faq-loader__card">
                  <div className="faq-loader__header" />
                  <div className="faq-loader__item" />
                  <div className="faq-loader__item" />
                  <div className="faq-loader__item" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      <div className="faq-gradient" />

      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-badge">Help Center</span>
          <h1 className="faq-title">
            <span className="faq-title__text">Frequently Asked Questions</span>
          </h1>
          <p className="faq-subtitle">
            Everything you need to know about Vicharanashala Internship. Can't find what you're looking for?{' '}
            <a href="#contact" className="faq-contact-link">Contact our support team</a>.
          </p>
        </div>

        <div className="faq-search-wrapper">
          <div className="faq-search">
            <svg className="faq-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <AutocorrectInput
              className="faq-search-input"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {micSupported && (
              <button
                className={`faq-search-mic ${listening ? 'faq-search-mic--active' : ''}`}
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
              <button className="faq-search-clear" onClick={() => setSearchQuery('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              )}
            </div>
            <button className="faq-ask-btn" onClick={() => navigate('/community')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New question
            </button>
          </div>

        {displayedData.length === 0 ? (
          <div className="faq-empty">
            <div className="faq-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h3>No results found</h3>
            <p>Try a different search term or browse categories above.</p>
            <button className="faq-empty-btn" onClick={() => setSearchQuery('')}>
              Clear search
            </button>
          </div>
        ) : isSearching ? (
          <>
            <div className="faq-results-count">
              <span className="faq-results-count__dot" />
              Found {displayedData.reduce((sum, cat) => sum + cat.questions.length, 0)} result(s)
            </div>
            <div className="faq-list">
              {displayedData.map((category, catIdx) => (
                <div key={catIdx} className="faq-category-card" style={{ animationDelay: `${catIdx * 0.05}s` }}>
                  <div className="faq-category-card__header">
                    <span className="faq-category-card__icon">{category.icon}</span>
                    <h2 className="faq-category-card__title">{category.category}</h2>
                  </div>
                  {category.questions.map((item, qIdx) => (
                    <FAQItem
                      key={item._id || qIdx}
                      number={qIdx + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItems[catIdx] === qIdx}
                      onToggle={() => toggleItem(catIdx, qIdx)}
                      catId={category._id}
                      qId={item._id}
                      views={item.views}
                      onView={() => handleView(catIdx, qIdx)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="faq-grid" ref={gridRef}>
            {displayedData.map((category, catIdx) => (
              <div key={category._id || catIdx} className="faq-category-card" style={{ animationDelay: `${catIdx * 0.06}s` }}>
                <div className="faq-category-card__header">
                  <span className="faq-category-card__icon">{category.icon}</span>
                  <h2 className="faq-category-card__title">{category.category}</h2>
                  <span className="faq-category-card__count">{category.questions.length}</span>
                </div>
                <div className="faq-category-card__body">
                  {category.questions.map((item, qIdx) => (
                    <FAQItem
                      key={item._id || qIdx}
                      number={qIdx + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItems[catIdx] === qIdx}
                      onToggle={() => toggleItem(catIdx, qIdx)}
                      catId={category._id}
                      qId={item._id}
                      views={item.views}
                      onView={() => handleView(catIdx, qIdx)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="faq-footer">
          <p>Still have questions? <a href="#contact">Get in touch →</a></p>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
