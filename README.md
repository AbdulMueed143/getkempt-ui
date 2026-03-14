# GetKempt — Frontend

Booking and business management platform for barbershops, hair salons, nail studios, and grooming businesses. Built with Next.js and Tailwind CSS.

---

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **React Hook Form + Zod** — form validation
- **Zustand** — state management
- **Recharts** — data visualisation
- **Lucide React** — icons

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app redirects to `/login` by default.

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm start
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
app/
├── (auth)/               # Login, signup, forgot/reset password
└── (dashboard)/
    └── dashboard/
        ├── page.tsx      # Main dashboard
        ├── staff/        # Staff management
        └── services/     # Services & booking menu

components/
├── ui/                   # Reusable primitives (Button, Input, Toast, Dialog…)
├── providers/            # App-level providers (toasts, confirm dialog)
├── layout/               # Auth brand panel
└── dashboard/
    ├── layout/           # Sidebar, Topbar, Shell
    ├── widgets/          # Dashboard stat cards, charts, bookings
    ├── staff/            # Staff page components
    └── services/         # Services page components

lib/
├── mock/                 # Mock data (dashboard, staff, services)
├── validations/          # Zod schemas
└── utils/                # Helpers (cn)

store/                    # Zustand stores (auth, toast, dialog)
hooks/                    # Custom hooks (useAuth, useToast, useConfirm)
types/                    # TypeScript interfaces
constants/                # Routes and app-wide constants
```

---

## Pages

| Route | Description |
|---|---|
| `/login` | Login |
| `/signup` | Sign up |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password |
| `/dashboard` | Overview — stats, bookings, alerts |
| `/dashboard/staff` | Staff management |
| `/dashboard/services` | Services & booking menu |
