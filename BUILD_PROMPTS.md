# FAQ Portal — Build Prompts (Step by Step)

A chronological record of all prompts used to build the Vicharanashala FAQ Portal from scratch.

---

## Phase 1: Foundation

### 1. Initialize the project
Set up a React frontend (create-react-app) with react-router-dom and a Node.js + Express + MongoDB backend. Initialize a git repo for backup.

### 2. Create backend models
Create Mongoose models for FAQ (with embedded question/answer subdocuments), OAQ (community Q&A with voting arrays, answer subdocuments), and User (name, email, bcrypt password, role). Include virtuals on OAQ for netVotes.

### 3. Build auth system
Create JWT auth middleware, register/login/me endpoints. User model with bcrypt password hashing (Mongoose 9+ pre-save hook, no `next` callback).

### 4. Create seed script
Write a seed script with 12 FAQ categories and ~100 Q&A entries covering the Vicharanashala Internship.

### 5. Set up frontend routing
React 18 with routes: `/` (HomePage), `/faq` (FAQPage), `/community` (OAQPage), `/dashboard`, `/admin`, `/leaderboard`, `/login`, `/register`.

### 6. Build components
FAQItem accordion component (numbered, single-open, chevron), CategoryTabs, Navbar with links, AuthContext/ThemeContext providers.

---

## Phase 2: Core Features

### 7. Build FAQ page
FAQPage with search bar, category tabs, accordion list, fuzzy search via `./*./` regex, view counter badge on each question.

### 8. Build OAQ (Community) page
OAQPage with question submission form, AI duplicate detection (word-overlap scoring), voting (up/down toggle), answer submission, sorting (trending/newest/votes), score display.

### 9. Build voting system
Toggle vote logic — one vote per user. Upvote removes existing upvote, switches from downvote. Downvote removes existing downvote, switches from upvote. Store in `votedUpBy`/`votedDownBy` ObjectId arrays.

### 10. Build admin panel
AdminPage with tabs (Open/Approved/Promoted/Rejected). Admin can approve, reject, promote to FAQ, edit answers, accept/unaccept answers. Promote prefers accepted answer, falls back to best-voted.

### 11. Build homepage
Hero banner with blue gradient, "How can we help you?" title, search bar with autocomplete suggestions, quick filters (All/Trending/Open/Resolved), category cards grid, trending OAQs (score = upvotes*3 + views*0.5 + answers*2), latest discussions, stats bar.

### 12. Build smart search
`/api/search/all` (FAQ + OAQ combined), `/api/search/suggest` (typo-tolerant autocomplete), fuzzy char-level regex, relevance sorting.

### 13. Add view counters
Real-time view count updates on FAQ questions and OAQs via local state (no page refresh needed).

### 14. Build leaderboard
LeaderboardPage with ranked contributor list (computed on-the-fly from OAQ aggregation), top 3 gold/silver/bronze styling, scoring rules panel.

### 15. Build dashboard
DashboardPage with user stats (categories, questions, open Q&A, promoted), trending section, user's questions list, quick links.

### 16. Add AI module
`/api/ai/related` (keyword-based recommendations), `/api/ai/check-duplicate` (word-overlap scoring >40% flags potential duplicates).

### 17. Build theme toggle
Dark/light mode via CSS custom properties on `[data-theme]` attribute. ThemeContext + useTheme hook. Hanging lamp UI (cord + bulb SVG, swing animation) positioned on far right of navbar. Preference saved to localStorage but default always light.

---

## Phase 3: Notifications & Reports

### 18. Create notification system
Notification model + API (GET list, PUT mark read, PUT mark all read). NotificationBell component in navbar with dropdown, unread badge, type icons (💬 answer, ⭐ promoted, ✅ accepted, 👍 approved). Dropdown shows message, time ago, links to relevant page.

### 19. Add notification triggers
Create notifications when: someone answers your OAQ, admin approves/rejects your question, admin promotes your question, your answer is accepted, auto-promoted to FAQ.

### 20. Add auto-promote
When an approved OAQ reaches 10+ net votes, auto-promote to FAQ (using accepted answer or best-voted one), create notification.

### 21. Create report system
Report model + API (POST report, GET for admin, PUT resolve/dismiss, DELETE content). Report button on OAQ questions and answers with modal. Reports tab in admin panel with actions.

---

## Phase 4: UI Enhancements

### 22. Add voice search
Mic button on Home and FAQ search bars using Web Speech API. Red pulsing glow while listening, auto-fills search and triggers results. Hidden if browser unsupported.

### 23. Add "New question" button
Button on Home and FAQ pages linking to `/community`. White with indigo text in light mode, white with dark text in dark mode, matching shadow as search bar.

### 24. Make homepage search bar always white
Homepage search bar and "New question" button are white in both light and dark modes to contrast against the blue hero gradient.

### 25. Category cards flip + modal
Clicking a category card triggers a flip animation (scale + rotateY), then opens a modal showing all FAQ questions for that category as expandable accordions (using FAQItem component). "View all in FAQ" button at bottom.

### 26. Add 13th category
Added "Team Formation" category to seed data (matches section 13 from the actual FAQ HTML).

### 27. Dynamic category dropdown
OAQ form category dropdown fetches categories from `/api/faqs` on mount instead of hardcoded list. Shows only categories that exist. Added "Other" option.

### 28. Remove optional labels
Category field is now required (no "(optional)" label). Description placeholder cleaned up.

### 29. Admin promote anytime
Removed 10-vote gate on admin promote button. Admin can promote any approved question.

### 30. Promote respects OAQ category
When promoting to FAQ, the question goes into the FAQ category matching the OAQ's category (or "Community Questions" if no category set).

---

## Phase 5: AI Answer Analysis

### 31. Groq AI answer summarization
Added `groq-sdk`. Created `/api/ai/summarize/:oaqId` (admin only, POST). Sends all answers to Groq (llama-3.3-70b-versatile) and returns JSON with summary, best answer index, reason. "AI Summarize" button in admin panel per OAQ, displays result panel with summary and best answer recommendation.

---

## Tech Stack
- **Frontend:** React 18, react-router-dom v7, CSS custom properties
- **Backend:** Node.js, Express, MongoDB (Mongoose 9+)
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **AI:** Groq SDK (llama-3.3-70b-versatile)
- **Build:** create-react-app

## Env File (backend/.env)
```
MONGO_URI=mongodb://localhost:27017/faq-app
PORT=5000
GROQ_API_KEY=your_groq_key_here
```
