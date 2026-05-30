/*
 * HomePage.js — Main landing page for the FAQ application.
 *
 * === OVERALL PURPOSE ===
 * Renders the homepage hero section (search bar, quick filters),
 * category cards, trending questions, latest discussions, and a
 * modal that lists questions per category.  Data is fetched from
 * two API endpoints on mount.  Search is performed client‑side
 * (instant, no server round‑trip).
 *
 * === DATA FLOW (Fetching → Filtering → Display) ===
 * 1. On mount, `useEffect` fires `Promise.all` on:
 *      • GET /api/home     → returns `homeData` (categories, trending, latest)
 *      • GET /api/oaq?status=all → returns `allOaqs` (community questions)
 * 2. Both responses are stored in state (`homeData`, `allOaqs`).
 * 3. `loading` is set to `false` once both complete (or either fails).
 * 4. Filtering happens via `useMemo` (`searchResults`) and derived
 *    booleans (`filteredTrending`, `filteredLatest`).
 * 5. The render method decides what to display based on:
 *      • `searchResults !== null`  → show results card
 *      • `!searchResults`          → show categories + trending + latest
 *      • `selectedCat !== null`    → overlay the category modal
 *
 * === COMPONENT TREE ===
 *   HomePage
 *     ├── AutocorrectInput (search text field)
 *     ├── FAQItem (in search results)
 *     ├── FAQItem (in category modal)
 *     └── navigate() links to /community, /faq
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AutocorrectInput from './AutocorrectInput';
import { useNavigate } from 'react-router-dom';
import FAQItem from './FAQItem';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────────────
     homeData    : API response from /api/home (categories, trending, latest)
     allOaqs     : all community Q&A items from /api/oaq?status=all
     loading     : controls the initial loading spinner
     searchQuery : the current text in the search input
     openItems   : tracks which FAQItem accordions are open (by index)
     activeTab   : 'all' | 'trending' | 'open' | 'resolved'
     listening   : whether the voice‑recognition mic is active
     selectedCat : the category object for which the modal is open (null = closed)
     flipping    : the _id of the category card currently animating flip
     catOpenItems: tracks which FAQ items are open inside the modal
   ──────────────────────────────────────────────────────────────── */
  const [homeData, setHomeData] = useState(null);
  const [allOaqs, setAllOaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [listening, setListening] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [flipping, setFlipping] = useState(null);
  const [catOpenItems, setCatOpenItems] = useState({});

  /* ── Refs ──────────────────────────────────────────────────────
     searchInputRef    : direct reference to the AutocorrectInput (<input>)
     gridRef           : reference to the category grid container (unused)
     recognitionRef    : holds the current SpeechRecognition instance
   ──────────────────────────────────────────────────────────────── */
  const searchInputRef = useRef(null);
  const gridRef = useRef(null);
  const recognitionRef = useRef(null);

  /* ── Web Speech API detection ──────────────────────────────────
     Checks if the browser supports SpeechRecognition (standard or
     webkit prefixed).  The mic button is only shown if supported.
   ──────────────────────────────────────────────────────────────── */
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micSupported = !!SpeechRecognition;

  /* ── Voice search (toggleListening) ─────────────────────────────
     Called when the mic button is clicked.
     • If already listening → stops current recognition & sets
       `listening` to false.
     • Otherwise → creates a new SpeechRecognition instance, sets
       language to en‑US, and starts listening.
     • `onresult` : captures the transcript, sets it as the search
       query, and stops listening.
     • `onerror` / `onend` : ensure `listening` is reset to false.
   ──────────────────────────────────────────────────────────────── */
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

  /* Clean up the recognition instance on unmount to prevent
     dangling microphone access. */
  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  /* ── Data fetching ─────────────────────────────────────────────
     On component mount, fetch both endpoints in parallel:
       • /api/home  → contains categoryCards, trending[], latest[]
       • /api/oaq?status=all → contains all community questions
     The `.catch()` on the OAQ fetch ensures the home page still
     loads even if the community API is unavailable.
     `loading` is set to `false` after both complete (or fail).
   ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      fetch('/api/home').then(r => r.json()),
      fetch('/api/oaq?status=all').then(r => r.json()).catch(() => []),
    ]).then(([home, oaqs]) => {
      setHomeData(home);
      setAllOaqs(oaqs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /* ── Keyboard shortcut (/) ─────────────────────────────────────
     Pressing "/" (when the search input is not already focused)
     focuses the search input.  This mimics the behaviour of many
     documentation sites (e.g. GitHub, MDN).
     The listener is cleaned up on unmount.
   ──────────────────────────────────────────────────────────────── */
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

  /* ── Runtime search (client‑side, instant) ─────────────────────
     This `useMemo` recomputes whenever `searchQuery`, `homeData`,
     or `allOaqs` changes.

     HOW IT WORKS:
     1. If the query is empty or shorter than 2 characters → returns null
        (meaning "no search active", so the normal page sections show).
     2. Splits the trimmed query into words (whitespace‑separated).
     3. A match function checks that every word is contained in the
        target text (case‑insensitive).
     4. Scans two data sources:
        a) `homeData.categoryCards` → each category's `questions[]`
           is searched; matching items get `_type: 'FAQ'` and category
           metadata attached.
        b) `allOaqs[]` → searches `item.question`; matching items get
           `_type: 'OAQ'`.
     5. Returns the combined array (or empty array if no matches).

     This is a UNION search (not intersection) across both sources.
   ──────────────────────────────────────────────────────────────── */
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return null;
    const words = q.split(/\s+/).filter(Boolean);
    const match = text => words.every(w => text.toLowerCase().includes(w));

    const combined = [];
    if (homeData?.categoryCards) {
      for (const cat of homeData.categoryCards) {
        for (const item of (cat.questions || [])) {
          if (match(item.q) || match(item.a || '')) {
            combined.push({ ...item, _type: 'FAQ', _cat: cat.category, _icon: cat.icon, _catId: cat._id });
          }
        }
      }
    }
    for (const item of allOaqs) {
      if (match(item.question)) {
        combined.push({ ...item, _type: 'OAQ' });
      }
    }
    return combined;
  }, [searchQuery, homeData, allOaqs]);

  /* ── Accordion toggle (search results) ─────────────────────────
     Each FAQItem in the search results list can be toggled open/closed.
     Uses an object keyed by index; `0` = open, `null` = closed,
     `undefined` = initial closed state.
   ──────────────────────────────────────────────────────────────── */
  const toggleItem = useCallback((idx) => {
    setOpenItems(prev => ({ ...prev, [idx]: prev[idx] === undefined ? 0 : prev[idx] === 0 ? null : 0 }));
  }, []);

  /* ── View handler ──────────────────────────────────────────────
     Marks an FAQ item as "viewed" in the openItems state (triggers
     a visual indicator on the FAQItem).  Keyed by catId‑qId.
   ──────────────────────────────────────────────────────────────── */
  const handleView = useCallback((catId, qId) => {
    setOpenItems(prev => ({ ...prev, [catId + '-' + qId]: true }));
  }, []);

  /* ── Quick filter definitions ──────────────────────────────────
     Each pill maps to an `activeTab` value:
       'all'       → show trending + latest
       'trending'  → show only trending
       'open'      → show items with status === 'open'
       'resolved'  → show items with status 'approved' | 'promoted'
   ──────────────────────────────────────────────────────────────── */
  const quickFilters = [
    { key: 'all', label: 'All' },
    { key: 'trending', label: 'Trending' },
    { key: 'open', label: 'Open' },
    { key: 'resolved', label: 'Resolved' },
  ];

  /* Derived booleans that control section visibility */
  const showTrending = activeTab === 'all' || activeTab === 'trending';
  const showLatest = activeTab === 'all';
  const showOpenOnly = activeTab === 'open';
  const showResolvedOnly = activeTab === 'resolved';

  /* ── Filtered lists ────────────────────────────────────────────
     `filteredTrending` and `filteredLatest` are derived from
     `homeData` but filtered by the active tab's status rules.
     They are only non‑empty when `searchResults` is null (i.e. no
     active search, so the normal page layout is shown).
   ──────────────────────────────────────────────────────────────── */
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

  /* ── Loading state ─────────────────────────────────────────────
     While data is being fetched, display a centred CSS spinner.
   ──────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="home-page">
        <div className="home-container"><div className="home-loader" /></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Decorative blue gradient behind the hero */}
      <div className="home-gradient" />

      <div className="home-container">

        {/* ══════════════════════════════════════════════════════════
            HERO / SEARCH SECTION
            ══════════════════════════════════════════════════════════
            Contains:
              • Badge ("Vicharanashala Help Center")
              • Title ("How can we help you?")
              • Subtitle
              • Search bar (AutocorrectInput + mic + clear)
              • "New question" button (navigates to /community)
              • Quick filter pills (All / Trending / Open / Resolved)
        */}
        <div className="home-hero">
          <span className="home-badge">Vicharanashala Help Center</span>
          <h1 className="home-title">How can we help you?</h1>
          <p className="home-subtitle">Search our knowledge base, ask the community, or browse categories below.</p>

          <div className="home-search-wrapper">
            <div className="home-search">
              {/* Magnifying glass icon (decorative, pointer‑events: none) */}
              <svg className="home-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>

              {/* AutocorrectInput — a controlled input that provides
                  autocorrect suggestions (from the sibling component).
                  `inputRef` is forwarded so the parent can focus/clear it. */}
              <AutocorrectInput
                className="home-search-input"
                placeholder="Search questions, keywords, or topics...  (press / to focus)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                inputRef={searchInputRef}
              />

              {/* Voice search mic button — only shown when the
                  browser supports SpeechRecognition.
                  The `--active` class applies when `listening` is true,
                  adding a red pulsing animation. */}
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

              {/* Clear (X) button — only shown when `searchQuery`
                  is non‑empty.  Clicking it resets the query. */}
              {searchQuery && (
                <button className="home-search-clear" onClick={() => { setSearchQuery(''); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* "New question" button — navigates to the community
                page where users can post a new question. */}
            <button className="home-ask-btn" onClick={() => navigate('/community')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New question
            </button>

          </div>

          {/* Quick filter pills — control which subset of trending/
              latest items is shown.  The active pill gets a bright
              background via the `.active` class. */}
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

        {/* ══════════════════════════════════════════════════════════
            SEARCH RESULTS SECTION
            ══════════════════════════════════════════════════════════
            When `searchResults !== null` (i.e. user typed ≥2 chars),
            the categories / trending / latest sections are hidden and
            this results card is shown instead.
            _______________________________________________________
            Header: "X results" count + "Clear" button
            If results array is empty  → empty state with CTA
            Otherwise                 → list of result items:
              • FAQ items  → rendered as <FAQItem> with accordion
              • OAQ items  → rendered as a simple card, clicking
                             navigates to /community
        */}
        {searchResults !== null && (
          <div className="home-results">
            <div className="home-results-header">
              <span className="home-results-count">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
              <button className="home-results-clear" onClick={() => { setSearchQuery(''); }}>Clear</button>
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
                    /* FAQ result: uses the reusable FAQItem accordion */
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
                    /* OAQ (community) result: simple card, click navigates to /community */
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

        {/* ══════════════════════════════════════════════════════════
            CATEGORY CARDS SECTION
            ══════════════════════════════════════════════════════════
            Rendered only when no search is active (searchResults is null).
            Each card shows:
              • An emoji icon
              • The category name
              • Question count
            _______________________________________________________
            Click behaviour:
              1. `setFlipping(cat._id)` triggers the CSS flip animation
                 on that card.
              2. After 300 ms the flip class is removed and the modal
                 is opened by setting `selectedCat`.
            _______________________________________________________
            Staggered entrance: each card has `animationDelay` set in
            increments of 0.05 s for a cascading fade‑in effect.
        */}
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

        {/* ══════════════════════════════════════════════════════════
            TRENDING QUESTIONS SECTION
            ══════════════════════════════════════════════════════════
            Shown when:
              • No search is active (searchResults is null)
              • `showTrending` is true (activeTab is 'all' or 'trending')
              • The filtered list has items
            _______________________________________________________
            Each item is clickable → navigates to /community.
            Shows rank number, question text, views, and answer count.
            Staggered entrance via `animationDelay` (0.08 s intervals).
        */}
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
                <div key={o._id} className="home-trending-item" onClick={() => navigate('/community')} style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="home-trending-item__rank">#{i + 1}</span>
                  <div className="home-trending-item__body">
                    <div className="home-trending-item__q">{o.question}</div>
                    <div className="home-trending-item__meta">
                      <span>{o.views || 0} views</span>
                      <span>{o.answers?.length || 0} answers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            LATEST DISCUSSIONS SECTION
            ══════════════════════════════════════════════════════════
            Shown when:
              • No search is active (searchResults is null)
              • `showLatest` is true (activeTab is 'all')
              • The filtered list has items
            _______________________________________________________
            Each item is clickable → navigates to /community.
            Displays the question, author name, date (formatted in
            en‑IN locale), and a status badge coloured by status type.
        */}
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

        {/* ══════════════════════════════════════════════════════════
            CATEGORY MODAL
            ══════════════════════════════════════════════════════════
            Rendered when a category card is clicked (`selectedCat` is set).

            HOW IT WORKS:
            1. A fixed‑position overlay (`home-cat-overlay`) covers the
               screen with a semi‑transparent backdrop.
            2. Clicking the overlay itself (not the modal) closes it.
            3. The modal card (`home-cat-modal`) stops event propagation
               so clicks inside do not close it.
            4. Header: category icon, name, question count.
            5. Body: scrollable list of FAQItem components — each has
               an accordion toggle and an `onView` callback that
               increments the view count optimistically in state.
            6. Footer: "View all in FAQ" button navigates to /faq and
               closes the modal.
            7. The close (X) button and the overlay click both reset
               `selectedCat` and `catOpenItems`.
        */}
        {selectedCat && (
          <div className="home-cat-overlay" onClick={() => { setSelectedCat(null); setCatOpenItems({}); }}>
            <div className="home-cat-modal" onClick={e => e.stopPropagation()}>
              {/* Close button */}
              <button className="home-cat-close" onClick={() => { setSelectedCat(null); setCatOpenItems({}); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>

              {/* Header */}
              <div className="home-cat-modal__header">
                <span className="home-cat-modal__icon">{selectedCat.icon}</span>
                <h2 className="home-cat-modal__title">{selectedCat.category}</h2>
                <span className="home-cat-modal__count">{selectedCat.count} question{selectedCat.count !== 1 ? 's' : ''}</span>
              </div>

              {/* Scrollable body — renders FAQItem for each question */}
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
                          /* Optimistically increment the view count for this
                             question in the selectedCat state.  This avoids
                             a server round‑trip for a simple view bump. */
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

              {/* Footer */}
              <div className="home-cat-modal__footer">
                <button className="home-cat-modal__btn" onClick={() => { setSelectedCat(null); setCatOpenItems({}); navigate('/faq'); }}>
                  View all in FAQ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default HomePage;
