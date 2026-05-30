/*
 * AutocorrectInput — Search input with a live suggestion dropdown.
 *
 * How it works:
 *   1) Whenever the `value` changes, a 250 ms debounce timer fires a
 *      fetch to /api/search/suggest?q=... to get matching suggestions.
 *   2) The dropdown is shown/hidden via local state and positioned
 *      absolutely below the input via .autocorrect-dropdown CSS.
 *   3) Keyboard navigation: ArrowUp/ArrowDown cycle the selected index,
 *      Enter picks the highlighted suggestion, Escape closes the dropdown.
 *   4) Clicking outside the wrapper closes the dropdown.
 *
 * Data flow:
 *   Suggestions are objects with { text, type }. Type is used to show
 *   an icon (📖 for FAQ, 💬 for community). Selecting a suggestion sets
 *   the input value to s.text and closes the dropdown.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

function AutocorrectInput({ value, onChange, placeholder, className, as: Comp = 'input', rows, style, inputRef }) {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  // ── Fetch suggestions from the API ──
  // Only fires when the trimmed query is ≥2 characters.
  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShow(data.length > 0);
      }
    } catch { /* ignore network errors */ }
  }, []);

  // ── Debounced fetch ──
  // Every time `value` changes, clear the previous timer and set a new
  // one for 250 ms to avoid firing requests on every keystroke.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(value), 250);
    return () => clearTimeout(timerRef.current);
  }, [value, fetchSuggestions]);

  // ── Click-outside handler ──
  // Closes the dropdown when the user clicks anywhere outside the
  // wrapper element.
  useEffect(() => {
    const handle = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ── Select a suggestion ──
  // Sets the parent's value to the suggestion text and hides the dropdown.
  const pick = (s) => {
    onChange({ target: { value: s.text } });
    setShow(false);
  };

  // ── Keyboard navigation ──
  const handleKeyDown = (e) => {
    if (!show || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && selectedIdx >= 0) { e.preventDefault(); pick(suggestions[selectedIdx]); }
    else if (e.key === 'Escape') { setShow(false); setSelectedIdx(-1); }
    else setSelectedIdx(-1);
  };

  const inputProps = {
    type: 'text',
    placeholder,
    className,
    value,
    onChange: (e) => { onChange(e); setSelectedIdx(-1); },
    onKeyDown: handleKeyDown,
    onFocus: () => { if (suggestions.length > 0) setShow(true); },
    ref: inputRef,
    autoComplete: 'off',
  };

  return (
    <div className="autocorrect-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Render as <textarea> or <input> based on the `as` prop */}
      {Comp === 'textarea'
        ? <textarea {...inputProps} rows={rows} style={style} />
        : <input {...inputProps} style={style} />}

      {/* ── Suggestion dropdown ──
          Rendered only when there are suggestions and show is true.
          Each item shows a type icon and the suggestion text. */}
      {show && suggestions.length > 0 && (
        <ul className="autocorrect-dropdown">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={`autocorrect-item${i === selectedIdx ? ' autocorrect-item--active' : ''}`}
              onClick={() => pick(s)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="autocorrect-type">{s.type === 'FAQ' ? '📖' : '💬'}</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AutocorrectInput;
