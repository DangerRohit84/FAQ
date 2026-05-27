import React, { useState, useEffect, useCallback, useRef } from 'react';
import FAQItem from './FAQItem';
import './FAQPage.css';

function FAQPage() {
  const [faqData, setFaqData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState({});
  const searchTimer = useRef(null);
  const gridRef = useRef(null);

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
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="faq-search-clear" onClick={() => setSearchQuery('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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
                      key={qIdx}
                      number={qIdx + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItems[catIdx] === qIdx}
                      onToggle={() => toggleItem(catIdx, qIdx)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="faq-grid" ref={gridRef}>
            {displayedData.map((category, catIdx) => (
              <div key={catIdx} className="faq-category-card" style={{ animationDelay: `${catIdx * 0.06}s` }}>
                <div className="faq-category-card__header">
                  <span className="faq-category-card__icon">{category.icon}</span>
                  <h2 className="faq-category-card__title">{category.category}</h2>
                  <span className="faq-category-card__count">{category.questions.length}</span>
                </div>
                <div className="faq-category-card__body">
                  {category.questions.map((item, qIdx) => (
                    <FAQItem
                      key={qIdx}
                      number={qIdx + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItems[catIdx] === qIdx}
                      onToggle={() => toggleItem(catIdx, qIdx)}
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
