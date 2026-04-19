# 🚀 CareerCopilot — AI Job Copilot Frontend

A premium, production-ready **AI-powered career intelligence platform** built with **Next.js 14 App Router**, featuring a dark obsidian + emerald design system, GSAP animations, and a server-first RSC architecture.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)
![GSAP](https://img.shields.io/badge/GSAP-3.14-88CE02)

---

## ✨ Features

### 🏠 Landing Page (`/`)
- Animated hero section with GSAP staggered text reveal
- Bento-style feature cards (Resume Intelligence, Smart Matching, Application Tracker)
- Testimonial grid with hover effects
- Gradient CTA section with glassmorphism
- Responsive standalone navbar with brand identity

### 📊 Dashboard (`/dashboard`)
- Personalized greeting with momentum stats
- Bento stat cards (Applications, Match Score, Pending Interviews)
- Recent activity table with company logos, match % progress bars, and status chips
- AI Copilot Insights panel:
  - **Skill Gap Detection** — identifies missing skills with impact percentages
  - **High Match Job Alerts** — newly posted roles with ≥85% match
  - **Profile Strength** — checklist progress with percentage bar
- Floating Action Button (FAB) with emerald gradient

### 📄 Resume Upload (`/resume/upload`)
- Drag-and-drop upload zone with visual feedback
- File validation (PDF/DOCX, max 10MB)
- Upload state machine: `idle → uploading → parsing → complete → error`
- Animated progress bar during upload/parsing
- Parsed resume preview (summary, experience, skills) rendered from mock data
- "Continue to Analysis" CTA

### 🔍 Resume Analysis (`/resume/analysis`)
- **Two-column layout**: Resume Preview (60%) + Analysis Panel (40%)
- Resume preview with zoom, download, and print toolbar
- **ATS Score Gauge** — animated circular SVG with score fill
- **Missing Skills Grid** — 2×2 cards with severity indicators (critical/standard)
- **AI Suggestions** — current vs. improved bullet points with highlighted terms and copy button
- Role context card showing target position details

### 💼 Jobs Page (`/jobs`)
- **Three-column layout**: Filters | Job List | Copilot Insights
- Interactive filters:
  - Role category checkboxes with counts
  - Experience level toggle buttons
  - Priority skill chips (add/remove)
  - Search input
- Job cards with:
  - Company logo + match score badge
  - Location, salary, posting time metadata
  - Matched skills (green) and missing skills (red) chips
  - Apply Now + Bookmark actions
- Copilot sidebar:
  - Resume score for target company
  - Market trends with progress bars
  - AI optimizer suggestions

---

## 🎨 Design System

The UI follows a **"Digital Concierge"** philosophy with these tokens:

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#0b1326` | Base background |
| `surface-container` | `#171f33` | Primary cards |
| `surface-container-high` | `#222a3d` | Interactive panels |
| `primary` | `#4edea3` | Emerald accent / CTAs |
| `secondary` | `#ffb95f` | Warning / amber accent |
| `tertiary` | `#c0c1ff` | Purple accent |
| `on-surface` | `#dae2fd` | Primary text |
| `error` | `#ffb4ab` | Error states |

**Design rules**: No `1px` borders (use tonal shifts), no `#000`/`#fff`, `rounded-xl` everywhere, glassmorphism on sidebar.

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx                 # Landing page (Server Component)
│   ├── layout.tsx               # Root layout + fonts + GsapProvider
│   ├── globals.css              # Design system CSS + utilities
│   ├── dashboard/
│   │   ├── layout.tsx           # AppShell wrapper
│   │   └── page.tsx             # Dashboard (Server Component)
│   ├── resume/
│   │   ├── page.tsx             # Redirect → /resume/upload
│   │   ├── layout.tsx           # AppShell wrapper
│   │   ├── upload/page.tsx      # Upload page (Client Component)
│   │   └── analysis/page.tsx    # ATS analysis (Server Component)
│   └── jobs/
│       ├── layout.tsx           # AppShell wrapper
│       └── page.tsx             # Jobs listing (Client Component)
├── components/
│   ├── shared/
│   │   ├── AppShell.tsx         # Sidebar + TopNav + content area
│   │   ├── Sidebar.tsx          # Glass-morphism sidebar (desktop)
│   │   ├── SidebarMobile.tsx    # Drawer sidebar (mobile)
│   │   └── TopNav.tsx           # Fixed top navbar
│   ├── animations/
│   │   ├── HeroAnimation.tsx    # GSAP hero text timeline
│   │   └── ScrollReveal.tsx     # GSAP ScrollTrigger section reveal
│   └── resume/
│       └── AtsScoreGauge.tsx    # Animated circular SVG score gauge
├── lib/
│   ├── api.ts                   # Typed fetch() wrappers
│   ├── actions.ts               # Next.js Server Actions
│   ├── providers.tsx            # GSAP ScrollTrigger registration
│   └── utils.ts                 # cn(), match score helpers
└── hooks/
    └── useGsapScrollTrigger.ts  # Custom GSAP ScrollTrigger hook
```

### Server-First Strategy

| Page | Render Strategy | Why |
|---|---|---|
| `/` (Landing) | Server Component | Fully static, zero client JS for content |
| `/dashboard` | Server Component | Data fetched server-side, client leaves for interactivity |
| `/resume/upload` | Client Component | File drag-and-drop requires client interaction |
| `/resume/analysis` | Server Component | ATS data fetched server-side, `AtsScoreGauge` lazy-loaded |
| `/jobs` | Client Component | Filter state + real-time interaction |

---

## 🎬 Animation Strategy

**Performance-first**: GSAP is used for exactly **2 components**, everything else is CSS.

| What | How |
|---|---|
| Hero text entrance | GSAP timeline (`HeroAnimation.tsx`) — dynamically imported |
| Section scroll reveal | GSAP ScrollTrigger (`ScrollReveal.tsx`) — dynamically imported |
| Card hover lift | CSS: `hover:-translate-y-0.5 transition-all duration-200` |
| Button press | CSS: `active:scale-[0.96] transition-transform duration-150` |
| Nav link slide | CSS: `hover:translate-x-1 transition-all duration-200` |
| Skeleton loading | CSS: `animate-pulse` |
| Gradient shimmer | CSS `@keyframes shimmer` |

---

## 📦 Tech Stack

| Package | Purpose | Bundle Impact |
|---|---|---|
| `next@14` | Framework (App Router) | — |
| `react`, `react-dom` | Core | — |
| `typescript` | Type safety | Dev only |
| `tailwindcss@3.4` | Styling | Build-time only |
| `gsap` | Hero + ScrollTrigger only | ~45KB (lazy loaded) |
| `lucide-react` | Icon library | Tree-shakeable |
| `clsx` + `tailwind-merge` | Class utilities | ~2KB |

> **No Redux/RTK** — all data flows are simple request→response. Server Actions + `fetch()` with built-in caching replace global state.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Backend API base URL |

---

## 📱 Responsive Design

- **Desktop** (≥1024px): Full sidebar + 3-column job layout
- **Tablet** (768–1023px): Collapsed sidebar (hamburger), 2-column grids
- **Mobile** (<768px): Drawer sidebar overlay, single-column stacking, simplified nav

All touch targets meet the 44px minimum standard.

---

## 📄 License

This project is private and proprietary.
