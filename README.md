# EstateFlow CRM - Real Estate Sales & Inventory Platform

A modern, production-grade, and responsive **MERN Stack (MongoDB, Express, React, Node.js)** Real Estate Customer Relationship Management (CRM) and Inventory Management System.

---

## 🏛️ System Architecture

```
real-estate-crm-mern-stack/
├── package.json                    # Workspace root orchestrator with concurrently
├── .gitignore                      # Monorepo-wide git ignore
├── .env.example                    # Global environment variables template
├── README.md                       # Complete platform documentation
│
├── backend/                        # Node.js + Express + MongoDB Server
│   ├── config/
│   │   └── db.js                   # Mongoose connection with error safety
│   ├── controllers/                # REST API controllers
│   │   ├── authController.js       # Login (Email/Username case-insensitive)
│   │   ├── bookingController.js    # Atomic booking reservation logic
│   │   ├── buildingController.js   # Tower & Building inventory
│   │   ├── cmsController.js        # Dynamic platform labels & CMS content
│   │   ├── dashboardController.js  # Live KPI aggregations & analytics
│   │   ├── leadController.js       # Lead pipeline & activity notes
│   │   ├── notificationController.js# Real-time in-app notifications
│   │   ├── projectController.js    # Master real estate projects
│   │   ├── unitController.js       # Real-time property units inventory
│   │   └── userController.js       # RBAC user & team management
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT validation & RBAC guards
│   │   └── errorMiddleware.js      # Centralized error & 404 handler
│   ├── models/                     # Mongoose schemas with UUIDs
│   │   ├── Booking.js
│   │   ├── Building.js
│   │   ├── Lead.js
│   │   ├── Notification.js
│   │   ├── PageContent.js
│   │   ├── Project.js
│   │   ├── Unit.js
│   │   └── User.js
│   ├── routes/                     # Express REST route definitions
│   ├── test/                       # Comprehensive automated test suites
│   │   ├── test_crm.js             # 7-phase end-to-end API test suite
│   │   └── test_frontend_serve.js  # Production SPA deep-routing test
│   ├── utils/
│   │   ├── passwordUtils.js        # Canonical scrypt / pbkdf2 password hashing
│   │   └── seedDefaults.js         # Auto-bootstrap default users and CMS copy
│   ├── server.js                   # Express server with Helmet, Compression, Morgan
│   └── package.json
│
└── frontend/                       # React 18 + Vite SPA client
    ├── src/
    │   ├── components/             # Clean, decoupled modular components
    │   │   ├── common/             # Reusable UI components
    │   │   │   ├── EmptyState.jsx
    │   │   │   ├── JqueryDataTable.jsx
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   ├── MobileBottomNav.jsx
    │   │   │   ├── MobileNavMenuModal.jsx
    │   │   │   ├── MobileProfileModal.jsx
    │   │   │   ├── MobileQuickActionModal.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── NotificationDropdown.jsx
    │   │   │   ├── PageHeader.jsx
    │   │   │   ├── ProfileDrawer.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   ├── RecordActionModal.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── StatCard.jsx
    │   │   ├── dashboard/          # Modular dashboard widgets
    │   │   │   ├── DashboardCharts.jsx
    │   │   │   ├── DashboardFollowupsTable.jsx
    │   │   │   ├── DashboardKpiCards.jsx
    │   │   │   ├── DashboardRecentBookings.jsx
    │   │   │   ├── QuickLeadModal.jsx
    │   │   │   └── QuickNoteModal.jsx
    │   │   ├── leads/              # Modular leads components
    │   │   │   ├── LeadFilterBar.jsx
    │   │   │   ├── LeadModal.jsx
    │   │   │   ├── LeadNotesModal.jsx
    │   │   │   └── LeadStatsCards.jsx
    │   │   ├── properties/         # Modular properties components
    │   │   │   ├── BuildingModal.jsx
    │   │   │   ├── ProjectModal.jsx
    │   │   │   ├── UnitCardGrid.jsx
    │   │   │   └── UnitModal.jsx
    │   │   ├── bookings/           # Modular bookings components
    │   │   │   ├── BookingModal.jsx
    │   │   │   └── BookingReceiptModal.jsx
    │   │   └── users/              # Modular user management components
    │   │       └── UserModal.jsx
    │   ├── context/                # Global React contexts
    │   │   ├── AuthContext.jsx
    │   │   ├── CmsContext.jsx
    │   │   ├── NotificationContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── hooks/                  # Custom responsive hooks
    │   │   ├── useDebounce.js      # Debounced search & filtering
    │   │   └── useWindowSize.js    # Responsive breakpoint detection
    │   ├── layouts/
    │   │   └── MainLayout.jsx      # Multi-device adaptive layout shell
    │   ├── pages/                  # Clean container pages (lazy-loaded)
    │   │   ├── Bookings.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Leads.jsx
    │   │   ├── Login.jsx
    │   │   ├── Properties.jsx
    │   │   ├── Register.jsx
    │   │   ├── Settings.jsx
    │   │   └── Users.jsx
    │   ├── services/               # Axios API client services
    │   ├── styles/
    │   │   └── style.css           # Responsive light/dark mode stylesheet
    │   ├── utils/
    │   │   ├── alerts.js           # SweetAlert2 toasts & dialogs
    │   │   └── formatters.js       # Currency, date, and badge formatters
    │   ├── App.jsx                 # Lazy route orchestrator with Suspense
    │   └── main.jsx
    ├── vite.config.js              # Vendor chunking (react, charts, ui) & proxy
    └── package.json
```

---

## ⚡ Key Highlights & Restructuring Improvements

1. **Root Monorepo Runner**:
   - Single command `npm run dev` boots both backend and frontend concurrently with color-coded terminal tags.
2. **Backend Hardening**:
   - Fixed static client path to `frontend/dist` with SPA deep-routing fallback (`GET *`).
   - Integrated `helmet` (security headers), `compression` (Gzip/Brotli compression), `morgan` (HTTP dev logging), and `express-rate-limit` (auth brute-force mitigation).
   - Centralized error handling middleware returning standardized error responses.
3. **Frontend Modularization**:
   - Decomposed monolithic 800–1,350 line pages into modular, focused subcomponents inside `src/components/dashboard`, `src/components/leads`, `src/components/properties`, `src/components/bookings`, and `src/components/users`.
   - Populated `src/hooks/` with `useWindowSize` (breakpoint queries) and `useDebounce` (instant reactive search).
   - Implemented route-based lazy loading with `React.lazy()` and `<Suspense fallback={<LoadingSpinner />}>` in `App.jsx`.
   - Optimized Vite build via `manualChunks` in `vite.config.js` (`vendor-react`, `vendor-charts`, `vendor-ui`), shrinking the main client bundle from 643 kB to 42 kB with zero bundle size warnings.
4. **Fluid Responsive Layout**:
   - **Mobile (< 768px)**: Compact mobile top header, bottom quick navigation bar, full-screen action modals, card grid unit browsers, and responsive collapsible DataTables.
   - **Tablet (768px - 991px)**: Adaptive 2-column metrics layout, offcanvas navigation drawer.
   - **Desktop (>= 992px)**: Collapsible persistent sidebar, high-density data tables, multi-column analytics charts.
   - Complete Light & Dark mode support with zero flash on reload.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `localhost:27017` (or configured via `MONGO_URI`)

### 2. Installation
Run the root installation command:
```bash
npm run install:all
```
This installs dependencies across root, `backend/`, and `frontend/`.

### 3. Running the Full Stack (Development Mode)
From the root directory:
```bash
npm run dev
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Vite Proxy**: Transparently proxies `/api/*` from `:3000` to `:5000`.

Alternatively, you can run services individually:
```bash
# Backend only:
npm run dev:backend

# Frontend only:
npm run dev:frontend
```

---

## 🧪 Testing & Verification

Run all test suites directly from the root workspace:

```bash
# 1. Run full backend CRM test suite (Authentication, RBAC, Inventory, Double-Booking, Notifications)
npm run test

# 2. Run SPA production deep-route serving test
npm run test:serve

# 3. Build frontend bundle for production
npm run build
```

---

## 👥 Default Accounts Seeded Automatically

| Role | Email / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@crm.com` or `Super Administrator` | `admin123` | Full root access + Platform CMS Settings exclusivity |
| **Admin** | `admin@crm.com` or `System Administrator` | `admin123` | Leads, Bookings, Inventory, Users & Team Management |
| **Sales Employee** | `john.sales@crm.com` or `John Sales` | `sales123` | Leads pipeline, Unit inquiries, Reservation bookings |

---

## 🔒 Security & Concurrency Features

- **Atomic Double-Booking Guard**: Unit availability is verified and committed atomically in MongoDB; simultaneous booking attempts on the same property unit return HTTP 409 Conflict with safety notices.
- **Role-Based Access Control (RBAC)**: Enforced both on server endpoints via JWT bearer tokens and on client routing via `ProtectedRoute`.
- **Safe Staff Deletion**: Inactive staff deletion safely nullifies `assignedTo` references on active customer leads to prevent orphaned records.
