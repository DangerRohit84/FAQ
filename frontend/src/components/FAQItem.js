/*
 * FAQItem — A single expandable/collapsible FAQ question.
 *
 * Accordion behaviour:
 *   The parent (FAQPage) passes an `isOpen` boolean and an `onToggle`
 *   callback. When the trigger button is clicked, the parent toggles the
 *   open state. CSS handles the max-height/opacity transition on the
 *   answer content.
 *
 * View tracking:
 *   When the item opens for the first time (isOpen transitions to true),
 *   a POST request is sent to /api/faqs/:catId/questions/:qId/view to
 *   record the view server-side. The `triggered` ref prevents duplicate
 *   requests.
 *
 * Answer display:
 *   The answer string is split on sentence boundaries (period + space)
 *   and each sentence is rendered as a list item for readability.
 */

import React, { useEffect, useRef } from 'react';
import './FAQItem.css';

function FAQItem({ number, question, answer, isOpen, onToggle, catId, qId, views, onView }) {
  const triggered = useRef(false);

  // ── View tracking ──
  // When the item opens, POST a view event once (tracked via triggered ref).
  // Reset triggered when the item closes again.
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
      {/* ── Trigger button ──
          Clicking calls onToggle which the parent uses to update the
          open/closed state. aria-expanded reflects the current state
          for accessibility. */}
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faq-item__number">{number}</span>
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__views">{views || 0} view{(views || 0) !== 1 ? 's' : ''}</span>
        {/* ── Chevron icon ──
            Rotated 90° when open via the .faq-item--open modifier on the
            parent icon container. */}
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

      {/* ── Collapsible answer area ──
          The max-height / opacity transition is driven entirely by CSS
          based on the presence of .faq-item--open on the parent. */}
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
