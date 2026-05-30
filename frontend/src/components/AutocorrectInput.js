import { useState, useEffect, useRef, useCallback } from 'react';

function AutocorrectInput({ value, onChange, placeholder, className, as: Comp = 'input', rows, style, inputRef }) {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShow(data.length > 0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(value), 250);
    return () => clearTimeout(timerRef.current);
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handle = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const pick = (s) => {
    onChange({ target: { value: s.text } });
    setShow(false);
  };

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
      {Comp === 'textarea'
        ? <textarea {...inputProps} rows={rows} style={style} />
        : <input {...inputProps} style={style} />}
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
