import React, { useState, useEffect, useCallback, useRef } from 'react';
import FAQItem from './FAQItem';
import './FAQPage.css';

function FAQPage() {
  const [faqData, setFaqData] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState(new Set());
  const searchTimer = useRef(null);

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
    const key = `${catIndex}-${qIndex}`;
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="faq-page">
        <div className="faq-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      <div className="faq-gradient" />

      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-badge">💬 Help Center</span>
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Everything you need to know about Vicharanashala Internship. Can't find what you're looking for?{' '}
            <a href="#contact" className="faq-contact-link">Contact our support team</a>.
          </p>
        </div>

        <div className="faq-search-wrapper">
          <div className="faq-search">
            <svg className="faq-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              Found {displayedData.reduce((sum, cat) => sum + cat.questions.length, 0)} result(s)
            </div>
            <div className="faq-list">
              {displayedData.map((category, catIdx) => (
                <div key={catIdx} className="faq-category-card">
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
                      isOpen={openItems.has(`${catIdx}-${qIdx}`)}
                      onToggle={() => toggleItem(catIdx, qIdx)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="faq-grid">
            {displayedData.map((category, catIdx) => (
              <div key={catIdx} className="faq-category-card">
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
                      isOpen={openItems.has(`${catIdx}-${qIdx}`)}
                      onToggle={() => toggleItem(catIdx, qIdx)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="faq-footer">
          <p>Still have questions? <a href="#contact">Get in touch</a></p>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
