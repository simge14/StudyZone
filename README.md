# StudyZone — Peer-to-Peer Academic Skill Exchange Platform

> *"Birlikte Öğren, Birlikte Başar"* — Study Together, Succeed Together

StudyZone is a campus-exclusive peer learning ecosystem built for Işık University students. It eliminates the need for money or credits by enabling direct **skill barter** between students — teach what you know, learn what you need.

---

## Vision

Traditional academic help relies on paid tutors, generic online courses, or luck. StudyZone replaces this with a structured peer economy:

- A student who excels in Python but struggles with SQL finds a partner with the exact inverse profile.
- They **barter** their expertise directly — no money, no intermediary.
- Both level up. The campus ecosystem strengthens.

This is not just a study app. It is an **academic social contract** built on trust, reciprocity, and community.

---

## Core Features

| Feature | Description |
|---|---|
| **Skill Barter** | Post what you teach and what you want to learn. Match with peers directly. |
| **Learnership** | Opt-in study buddy matching. The system pairs you with a compatible partner (BR-19: max 1 active match). |
| **Pomodoro Timer** | Built-in 25/5 focus timer with daily goal tracking and Gem rewards. |
| **Study Spots** | Curated list of Anadolu Yakası cafes, libraries and study centers with Wi-Fi & socket info. |
| **Onboarding Guide** | 5-slide multilingual (TR/EN) carousel shown once on first login. |
| **Dashboard** | Personalized home with Gem counter, active barter count, daily goal and quick tools. |

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 19.x | UI framework |
| React Router DOM | 7.x | Client-side routing |
| Framer Motion | 12.x | Page transitions (AnimatePresence fade) and micro-interactions |
| react-i18next / i18next | 26.x | TR/EN multilingual support |
| Axios | 1.x | HTTP client with JWT interceptors |
| Custom CSS Design System | — | Navy (`#0A0075`) + Lavender (`#C4B3F5`) + Cream (`#F5F5EB`) theme, glassmorphism, dark mode |

### Backend
| Technology | Role |
|---|---|
| Node.js + Express | REST API server |
| Microsoft SQL Server | Relational database |
| msnodesqlv8 | Native SQL Server driver |
| dotenv | Environment configuration |
| CORS | Cross-origin request handling |

### Infrastructure
- **Auth**: JWT-based stateless authentication with localStorage persistence
- **OTP**: Email verification on registration
- **Proxy**: CRA dev proxy → `localhost:3000` (backend)

---

## Legal Compliance — KVKK

StudyZone is designed with **KVKK (Kişisel Verilerin Korunması Kanunu)** compliance from the ground up:

- Registration requires explicit **KVKK Clarification Text** acceptance before account creation.
- Users give a separate **Açık Rıza (Explicit Consent)** for sharing profile data and academic skills with peers for Learnership/Barter matching.
- Both consents are mandatory — the sign-up button remains disabled until both are checked.
- Only `@isik.edu.tr` email addresses are accepted, limiting access to verified university members.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Microsoft SQL Server (local or remote)
- npm ≥ 9

### 1 — Database
Import `StudyZoneDB.sql` into your SQL Server instance to create all tables and seed reference data.

### 2 — Backend
```bash
cd StudyZone--Backend
npm install
```

Create a `.env` file in the backend directory:
```env
DB_SERVER=localhost
DB_NAME=StudyZoneDB
DB_USER=sa
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

```bash
node index.js        # API starts on http://localhost:3000
```

### 3 — Frontend
```bash
cd "studyzone react/studyzone-frontend"
npm install
npm start            # App starts on http://localhost:3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Project Structure

```
studyzone-frontend/src/
├── api/
│   ├── axios.js            # Axios instance — JWT interceptor, online/offline events
│   └── auth.js             # Multi-path auth helpers (register, login, OTP)
├── components/
│   ├── Home.js             # Dashboard (logged-in) + hero screen (logged-out)
│   ├── Register.js         # Multi-step sign-up with KVKK consent checkboxes
│   ├── Login.js
│   ├── Profile.js
│   ├── BarterDashboard.js
│   ├── Learnership.js
│   ├── Pomodoro.js
│   ├── LocationGuide.js
│   ├── OnboardingGuide.js  # First-login 5-slide bilingual carousel
│   ├── SplashScreen.js     # 2.1 s animated logo splash on cold start
│   ├── Navbar.js           # Top header with SVG flag language switcher
│   ├── BottomNav.js
│   ├── Toast.js            # Slide-up notification toast
│   └── ErrorBoundary.js    # React error boundary wrapper
├── context/
│   ├── AuthContext.js      # JWT auth state — login, logout, updateUser
│   └── ThemeContext.js     # Dark / light mode toggle
├── hooks/
│   └── useCourses.js       # Multi-endpoint course list fetcher with fallback
├── i18n/
│   ├── locales/tr.json
│   └── locales/en.json
├── data/
│   ├── courses.js          # Static interest area constants
│   └── locations.js        # Static fallback study spot data
└── App.css                 # Centralized design system (~1 200 lines)
```

---

## Business Rules

| Rule | Description |
|---|---|
| BR-01 | Only `@isik.edu.tr` emails accepted at registration |
| BR-02 | Interests, goodAt and wantToLearn are required at sign-up |
| BR-04 | Learnership preference (yes/no) is mandatory during registration |
| BR-06 | Course list is sourced from the database, never hardcoded |
| BR-07 | Barter course selection is restricted to the user's own profile courses |
| BR-08 | No money, credits or payment of any kind in barter exchanges |
| BR-12 | Maximum 3 active barters per user at a time |
| BR-14 | The same course cannot be both taught and requested in a single barter |
| BR-16 | Completed barters can be rated with a 1–5 star system |
| BR-17 | Learnership opt-in auto-enrolls the user in the matching pool |
| BR-19 | Maximum 1 active Learnership match per user at a time |
| BR-23 | Partner contact info is revealed only after match confirmation |
| BR-31 | Study spots are limited to Anadolu Yakası, Istanbul |
| BR-33 | No ratings or comments on study spot listings |

---

## License

Developed as an academic capstone project at **Işık University**.  
All rights reserved © 2025–2026 StudyZone Team.
