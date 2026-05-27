import React, { useEffect, useRef } from 'react';
import './FAQItem.css';

function FAQItem({ number, question, answer, isOpen, onToggle, catId, qId, views, onView }) {
  const triggered = useRef(false);

  useEffect(() => {
    if (isOpen && !triggered.current) {
      triggered.current = true;
      fetch(`/api/faqs/${catId}/questions/${qId}/view`, { method: 'POST' })
        .then(() => onView && onView())
        .catch(() => {});
    }
    if (!isOpen) triggered.current = false;
  }, [isOpen, catId, qId, onView]);

  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faq-item__number">{number}</span>
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__views">{views || 0} view{(views || 0) !== 1 ? 's' : ''}</span>
        <div className="faq-item__icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="faq-item__chevron"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </button>
      <div className="faq-item__content" role="region">
        <ul className="faq-item__answer">
          {answer.split(/(?<=\.)\s+/).filter(Boolean).map((sentence, i) => (
            <li key={i}>{sentence}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FAQItem;
