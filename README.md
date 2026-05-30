# FAQ Portal — Vicharanashala Internship

A full-stack Q&A platform with FAQ management, community discussions, admin dashboard, and AI-powered features.

## Tech Stack

**Frontend:** React 18, React Router v7, CSS custom properties (dark/light themes)  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth (httpOnly cookies)  
**Features:** Voice search, autocorrect suggestions, AI answer quality checks, real-time search

## Project Structure

```
FAQ/
├── frontend/                  # React SPA
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── Navbar.js/css         # Top nav with hamburger mobile menu
│       │   ├── HomePage.js/css       # Landing page (hero, search, categories, trending)
│       │   ├── FAQPage.js/css        # FAQ browser with search & category cards
│       │   ├── FAQItem.js/css        # Accordion question/answer item
│       │   ├── AutocorrectInput.js   # Search input with suggestion dropdown
│       │   ├── NotificationBell.js   # Notification indicator
│       │   ├── ThemeToggle.js/css    # Dark/light mode switch
│       │   └── CategoryTabs.js/css   # Category filter tabs
│       ├── pages/             # Route-level page components
│       │   ├── OAQPage.js/css        # Community Q&A with voting & answers
│       │   ├── LoginPage.js          # Sign in
│       │   ├── RegisterPage.js       # Sign up
│       │   ├── DashboardPage.js/css  # User dashboard
│       │   ├── AdminPage.js/css      # Admin panel
│       │   └── LeaderboardPage.js/css# Top contributors
│       ├── context/           # React contexts
│       │   └── AuthContext.js        # Auth state (user, login, logout)
│       └── App.css            # Global styles (autocomplete dropdown)
├── backend/                   # Express API server
│   ├── server.js              # Entry point
│   ├── routes/                # API route handlers
│   ├── models/                # Mongoose schemas
│   ├── middleware/            # Auth & validation middleware
│   └── scripts/               # Seed scripts
└── README.md
```

## Features

### 🔍 Smart Search
- **Client-side filtering** — Instant multi-word substring matching across questions and answers
- **Autocomplete suggestions** — Debounced API calls to `/api/search/suggest` with keyboard navigation (Arrow keys, Enter, Escape)
- **Voice search** — Web Speech API integration for hands-free searching

### 📚 FAQ Management
- **Category cards** — Grouped FAQ display with gradient headers and scrollable question lists
- **Accordion expand/collapse** — One question open per category at a time with smooth height animation
- **View tracking** — POST request on first open to increment view counts

### 💬 Community Q&A (OAQ)
- **Submit questions** — With AI-assisted duplicate detection (409 conflict handling)
- **Voting system** — Upvote/downvote on questions and answers
- **Status workflow** — Open → Approved → Promoted (or Rejected)
- **Answer scoring** — Trending formula: `upvotes × 3 + views × 0.5 + answers × 2`
- **Report system** — Modal-based reporting with reason selection

### 🎨 Theming
- **Dark/Light mode** — Persistent theme toggle using CSS custom properties
- **Responsive design** — Mobile-first with hamburger nav (≤768px), stacked/grid layouts adjust at 768px, 640px, and 480px breakpoints

### 🔐 Authentication
- **JWT in httpOnly cookies** — Secure, server-set tokens
- **Role-based access** — User vs Admin with conditional UI rendering
- **Protected routes** — Dashboard, Admin panel

## Getting Started

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (port 5000)
cd ../backend
npm start

# Start frontend (port 3000, proxies API to 5000)
cd ../frontend
npm start
```

Create `backend/.env` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faqs` | All FAQ categories with questions |
| GET | `/api/home` | Homepage data (categories, trending, latest) |
| GET | `/api/oaq` | Community questions (with sorting) |
| POST | `/api/oaq` | Submit a new question |
| POST | `/api/oaq/:id/vote` | Upvote/downvote a question |
| POST | `/api/oaq/:id/answer` | Submit an answer |
| POST | `/api/oaq/:id/answer/:answerId/vote` | Vote on an answer |
| GET | `/api/search/suggest?q=` | Autocomplete suggestions |
| POST | `/api/reports` | Submit a report |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user info |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/admin/ai-check` | AI answer quality check |
