# Kanbot Client

> **Kanbot** (kanban + bot): *Your sprint board with an AI teammate.*
> 
> Frontend application for Kanbot - a personal todo app organized around agile sprints with an AI assistant.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Architecture](#architecture)
- [Day 1 Implementation Status](#day-1-implementation-status)
- [Known Issues](#known-issues)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The Kanbot backend running on `http://localhost:4000/api`

### Installation

```bash
cd client
npm install
```

### Environment Variables

Create a `.env` file (or use the existing one):

```env
VITE_API_URL=http://localhost:4000/api
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Design System

### UI Library Choice: Material-UI (MUI) v5

**Why MUI?**

- **Comprehensive Component Library**: MUI provides a complete set of pre-built, accessible components that align with modern design standards
- **Excellent TypeScript Support**: First-class TypeScript support with strong typing throughout
- **Theme Customization**: Powerful theming system allows complete customization while maintaining consistency
- **Accessibility Built-in**: Components follow WCAG guidelines with proper ARIA attributes, keyboard navigation, and focus management
- **Production-Ready**: Battle-tested in thousands of applications with excellent documentation
- **Active Development**: Regular updates, security patches, and community support

### Visual Design Direction

**Modern Minimal SaaS Dashboard**

The design follows a professional, clean, and organized aesthetic inspired by products like Linear, Asana, and Notion, while maintaining its own visual identity.

**Design Principles:**
- Clear visual hierarchy
- Balanced whitespace
- Consistent alignment
- Subtle borders and restrained shadows
- Practical and functional layouts
- No unnecessary decorations or animations
- Professional color usage

### Color Palette

#### Primary Blue
```
Main:        #3156A3
Dark:        #243F7C
Light:       #5578C7
Soft:        #EAF0FF (backgrounds)
Hover:       #294A91
```

#### Secondary Blue
```
Main:        #6686C9
Light:       #DCE7FA
Soft:        #F1F5FC
```

#### Green Brand Accent
Used selectively for brand identity, success states, and completed items:
```
Main:        #269B75
Dark:        #197B5C
Light:       #DDF4EA (backgrounds)
Soft:        #EFF9F4
```

#### Neutral Colors
```
Main Background:      #F6F8FC
Surface:              #FFFFFF
Surface Secondary:    #F9FAFD
Border:               #E5EAF2
Border Strong:        #D5DCE8
Text Main:            #202B3C
Text Secondary:       #667085
Text Muted:           #98A2B3
```

#### Semantic Colors
```
Success:    #269B75
Warning:    #D99A36
Error:      #D95D68
Info:       #4D82C5
```

All semantic colors have corresponding light tinted backgrounds for alerts and status labels.

### Typography

**Primary Font:** Inter (loaded from Google Fonts)

**Fallback Stack:** 
```
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif
```

**Type Scale:**
- Page title (h1): 30px, semibold
- Section title (h2): 20px, semibold
- Card title (h3): 16px, semibold
- Subsection (h4): 15px, medium
- Body text: 15px, regular
- Secondary text: 14px, regular
- Small labels: 12px, regular

### Spacing Scale

**Base unit:** 8px

The theme uses MUI's default spacing function where `spacing(1) = 8px`.

Common spacing values:
- 1 = 8px
- 2 = 16px
- 3 = 24px
- 4 = 32px
- 6 = 48px
- 8 = 64px

### Border Radius

- Default (inputs, buttons): 8px
- Cards: 12px
- Dialogs: 12px
- Small elements (chips, badges): 6px

### Shadows

Shadows are subtle and used sparingly:
- Card: `0 1px 3px rgba(32, 43, 60, 0.06)`
- Paper (elevated): `0 2px 8px rgba(32, 43, 60, 0.1)`
- Dialog: `0 8px 24px rgba(32, 43, 60, 0.15)`

### Icon Strategy

**Primary:** `@mui/icons-material` for all standard interface icons

**Guidelines:**
- Use professional, consistent icons
- Maintain consistent visual weight
- Standard size: 20px for navigation and buttons
- Compact size: 18px for tight spaces
- Large size: 24px for emphasis
- Never use emojis or Unicode symbols as icons

**Common Icons Used:**
- Dashboard, FolderOpen, ViewKanban, CalendarMonth
- Search, Settings, Notifications, MoreVert
- Add, Edit, Delete, Check, Close
- ErrorOutline, Home, SearchOff

### Responsive Layout Principles

**Breakpoints:**
- Desktop: 1024px+ (full layout)
- Tablet: 768px - 1023px (sidebar collapses, horizontal scroll on board)
- Mobile: < 768px (bonus - not required for Day 1)

**Future Dashboard Layout:**
- Sidebar width: ~240px
- Main content padding: 28-32px
- Header height: ~64px

### Component Styling Guidelines

**Buttons:**
- Use `variant="contained"` for primary actions
- Use `variant="outlined"` for secondary actions
- Use `variant="text"` for tertiary/minimal actions
- Always include hover, focus, disabled, and loading states

**Form Fields:**
- Consistent height across all inputs
- Clear labels above fields (not floating)
- Visible focus states
- Helpful error messages below fields
- Proper error styling with helper text

**Cards:**
- White background with subtle border
- Light shadow only when necessary
- Consistent padding (24px typical)
- Clear visual separation between sections

### Accessibility

**Standards:** WCAG 2.1 Level AA

**Implementation:**
- Semantic HTML elements (`<main>`, `<nav>`, `<button>`)
- All form fields have associated `<label>` elements
- Visible focus indicators (2px solid primary color with 2px offset)
- Color is never the only signal (icons or text accompany status colors)
- Keyboard navigation for all interactive elements
- Skip-to-main-content link for keyboard users
- Screen reader only text via `.sr-only` utility class
- Focus trap in dialogs with Esc to close

---

## Architecture

### Tech Stack

| Concern | Library | Version | Why |
|---------|---------|---------|-----|
| Framework | React | 19 | Latest stable with concurrent features |
| Language | TypeScript | 6.0 | Strict mode, no `any` without justification |
| Build Tool | Vite | 8 | Fast HMR, optimized builds |
| Routing | React Router | 8 | Standard routing with v6+ data APIs |
| UI Library | Material-UI | 9 | Comprehensive, accessible, themeable |
| Forms | react-hook-form + zod | 7 + 4 | Type-safe validation, excellent DX |
| Server State | TanStack Query | 5 | Caching, loading/error states, optimistic updates |
| HTTP Client | fetch (native) | - | Built-in, wrapped for error handling |
| Drag & Drop | @dnd-kit | 6 | Accessible, keyboard-friendly (Day 4+) |
| Markdown | react-markdown | 10 | AI responses, no raw HTML |
| Dates | date-fns | 4 | Lightweight, tree-shakeable |
| Notifications | sonner | latest | Toast notifications |

### Folder Structure

```
client/src/
├── main.tsx                    # App entry point, providers
├── router.tsx                  # Route definitions
├── index.css                   # Global styles
├── theme/
│   └── theme.ts               # MUI theme configuration
├── types/
│   └── api.ts                 # API contract (copied from server)
├── api/
│   ├── client.ts              # HTTP client with error handling
│   └── auth.ts                # Auth API functions
├── lib/
│   └── toast.tsx              # Toast notification utility
├── hooks/                      # TanStack Query hooks (Day 2+)
├── components/                 # Reusable UI components
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── LoadingSpinner.tsx
├── features/
│   └── auth/                  # Auth feature module
│       ├── AuthContext.tsx    # Auth context & hook
│       ├── AuthProvider.tsx   # Auth state management
│       ├── ProtectedRoute.tsx # Auth guard for private routes
│       ├── GuestRoute.tsx     # Auth guard for guest routes
│       ├── LoginPage.tsx      # Login page
│       ├── RegisterPage.tsx   # Register page
│       └── index.ts           # Feature exports
└── pages/
    └── NotFoundPage.tsx       # 404 page
```

**Future structure (Day 2+):**
- `features/projects/` - Projects list and forms
- `features/backlog/` - Backlog view and todos
- `features/board/` - Active sprint board
- `features/sprints/` - Sprint history and management
- `features/todos/` - Todo details dialog
- `features/ai/` - AI assistant panel and dialogs

### API Client Design

**File:** `src/api/client.ts`

**Core Features:**
- Base URL from environment variable
- Automatic JSON content type
- JWT token from localStorage in Authorization header
- ApiError class with status, code, message, and validation details
- `fieldErrors()` helper maps validation errors to form fields
- 401 handling: calls registered callback to clear session and redirect
- Network error handling with user-friendly messages
- Type-safe with TypeScript generics

**Usage:**
```typescript
import { api } from '../api/client';

const data = await api.get<ProjectListResponse>('/projects');
const project = await api.post<Project>('/projects', { name: 'New Project' });
```

### State Management Strategy

**Server State:** TanStack Query
- All data from the API lives in React Query cache
- Query keys: `['projects']`, `['project', id]`, `['todos', projectId]`, etc.
- Mutations invalidate related queries
- Optimistic updates for drag-and-drop

**Auth State:** React Context
- Token in localStorage
- User object in AuthContext
- Startup: validate token with GET /auth/me
- 401: clear session and redirect with toast notification

**UI State:** Component state (useState) or URL params
- Dialog open/closed
- Form inputs
- Filters (may use URL search params)

**No Redux or Zustand needed** - TanStack Query handles server state, Context handles auth, local state handles UI.

---

## Day 1 Implementation Status

### Completed ✅

#### Task 1: MUI Theme & Design System
- ✅ Centralized theme at `src/theme/theme.ts`
- ✅ Blue/green color palette with semantic colors
- ✅ Inter font family
- ✅ 8px spacing scale
- ✅ Consistent border radius (8-12px)
- ✅ Button variants (contained, outlined, text)
- ✅ Form input styling
- ✅ Card and Paper styling
- ✅ Dialog styling
- ✅ Alert and Snackbar styling
- ✅ Accessible focus states

#### Task 2: Global Styles
- ✅ Inter font loading from Google Fonts
- ✅ CSS reset
- ✅ Body background (#F6F8FC)
- ✅ Custom scrollbar styling
- ✅ Focus-visible for accessibility
- ✅ Utility classes (truncate, line-clamp)

#### Task 3: Foundation Components
- ✅ ConfirmDialog - Reusable confirmation modal
- ✅ EmptyState - Empty list/view placeholder
- ✅ ErrorState - Error display with retry
- ✅ LoadingSpinner - Loading indicator
- ✅ Toast utility (sonner library)

#### Task 4: API Client
- ✅ `src/api/client.ts` - HTTP wrapper with fetch
- ✅ ApiError class with structured errors
- ✅ fieldErrors() helper for form validation
- ✅ 401 unauthorized callback mechanism
- ✅ Network error handling
- ✅ `src/api/auth.ts` - register(), login(), me()

#### Task 5: Auth Provider
- ✅ `src/features/auth/AuthProvider.tsx`
- ✅ Token persistence in localStorage
- ✅ Startup token validation (GET /auth/me)
- ✅ Session expiration handling
- ✅ Full-page loading during initialization
- ✅ useAuth() hook for accessing auth state

#### Task 6: Router & Guards
- ✅ `src/router.tsx` - Route definitions
- ✅ ProtectedRoute - Redirects to /login if not authenticated
- ✅ GuestRoute - Redirects to /projects if authenticated
- ✅ Redirect parameter support (?redirect=)
- ✅ 404 NotFoundPage

#### Task 7: Login Page
- ✅ `src/features/auth/LoginPage.tsx`
- ✅ react-hook-form + zod validation
- ✅ Email and password fields
- ✅ Client validation (required, valid email)
- ✅ Server error display (401 shows above form)
- ✅ Loading state on submit
- ✅ Redirect to original URL or /projects
- ✅ Link to register page

#### Task 8: Register Page
- ✅ `src/features/auth/RegisterPage.tsx`
- ✅ react-hook-form + zod validation
- ✅ Name, email, password, confirm password fields
- ✅ Client validation (all required, valid email, password ≥8 chars, passwords match)
- ✅ Server errors mapped to fields
- ✅ 409 duplicate email shown under email field
- ✅ Loading state prevents double submission
- ✅ Auto-login on success

#### Task 9: Logo Integration
- ✅ Copied kanbot-logo.svg to client/public
- ✅ Copied kanbot-icon.svg to client/public
- ✅ Integrated logo in LoginPage
- ✅ Integrated logo in RegisterPage

#### Task 10: Documentation
- ✅ This README with complete design system documentation

### Day 1 Acceptance Criteria

#### AUTH-1: Register ✅
- ✅ Form: name, email, password, confirm password
- ✅ Client validation: all required, valid email, password ≥8 chars, confirm matches
- ✅ Server errors show under fields
- ✅ 409 shows "An account with this email already exists" under email
- ✅ Submit button has loading state
- ✅ No double submission
- ✅ On success, user is signed in and goes to /projects

#### AUTH-2: Log in ✅
- ✅ Form: email, password
- ✅ 401 shows server message above form
- ✅ On success, go to ?redirect= or /projects

#### AUTH-3: Stay logged in ✅
- ✅ Token persisted in localStorage
- ✅ On app start, GET /auth/me is called
- ✅ Full-page loader during validation
- ✅ Success → signed in
- ✅ 401 → token cleared, login shown

#### AUTH-4: Log out ✅
- ✅ Available via useAuth().logout()
- ✅ Clears token and cached data
- ✅ Navigates to /login

#### AUTH-5: Auth guard ✅
- ✅ Unauthenticated users redirected to /login?redirect=<page>
- ✅ Authenticated users redirected from /login to /projects

#### AUTH-6: Expired session ✅
- ✅ Any 401 (except login) clears session
- ✅ Redirects to /login?redirect=<current>
- ✅ Shows toast: "Your session has expired"

---

## Known Issues

None at this time. Day 1 implementation is complete and all auth features are working as specified.

---

## Next Steps (Day 2+)

- **Day 2:** App shell (sidebar, header), Projects page (list, create, edit, delete)
- **Day 3:** Backlog page, todo details dialog, search and filters
- **Day 4:** Planned sprints, drag and drop, start sprint
- **Day 5:** Board view, sprint completion, sprint history
- **Day 6:** AI assistant (chat, generate todos, plan sprint, summarize)
- **Day 7:** Polish, testing, bug fixes, enhancements

---

## License

This project is part of the Kanbot application. See the main repository for license information.
