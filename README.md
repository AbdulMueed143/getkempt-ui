# GetSquire — Salon & Barbershop Management Platform

> A professional booking and business management platform built for grooming businesses —
> barbershops, hair salons, nail studios, beauty spas, and more.
> Proudly Melbourne-made. Built to scale.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Jest + React Testing Library |
| Fonts | Rethink Sans · Hedvig Letters Serif (Google Fonts) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage
```

> Development server runs at **http://localhost:3000**

---

## Application Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Marketing homepage |
| `/login` | Login | Staff / owner sign in |
| `/signup` | Sign Up | New account registration |
| `/forgot-password` | Forgot Password | Request password reset |
| `/reset-password` | Reset Password | Set a new password |
| `/dashboard` | Dashboard | Overview stats, charts, quick actions |
| `/bookings` | All Bookings | Calendar view — day / week / month |
| `/clients` | Clients | Client list, search, bulk communication |
| `/staff` | Staff | Staff members, roles, availability |
| `/availability` | Availability | Weekly schedules + date overrides |
| `/visits` | Visits | Mark past appointments attended / no-show |
| `/services` | Services | Service catalogue, pricing, duration |
| `/packages` | Packages | Bundled services with discounts |
| `/loyalty` | Loyalty | Sequential loyalty reward programs |
| `/settings/store` | Store Settings | Scheduling, holidays, surcharges, policies |
| `/settings/profile` | Store Profile | Shop identity, location, social media |

---

## Current Features (v0.1 — Frontend Demo)

### 🗓 Bookings & Calendar
- Full calendar with **Day / Week / Month** views
- Colour-coded booking blocks per staff member
- Overlap-aware lane layout — concurrent bookings tile side-by-side
- Real-time "current time" indicator
- **Create booking flow** (4-step): Staff → Service/Package → Date & Available Slots → Client details
- Slot availability computed live from staff working hours minus existing bookings
- Click any booking to view details, edit, or cancel
- Booking sources: Mobile app · Manual (owner) · Walk-in

### 👥 Staff Management
- Add / edit / delete staff members
- Profile image upload with drag-and-drop
- Role system: Owner / Manager vs. Individual Staff
- Assigned services, pay structure (hourly / commission / fixed), bio
- Colour-coded calendar identity (auto-assigned)

### 📅 Availability
- Per-staff **weekly schedule** (Mon–Sun) with multiple time slots per day
- **Date-specific overrides** — close a day or change hours for a particular date
- **Break slots** — block time that cannot be booked (lunch, prep, etc.)
- IANA timezone stored as UTC; displayed in shop's local timezone
- Desktop sidebar staff list; mobile chip-scroll + tabbed layout

### ✅ Visits (Attendance Tracker)
- Lists all past appointments grouped by date
- Quick-mark individual appointments: **Attended** or **No-show**
- Optional note when marking a no-show
- Bulk select + batch mark attended / no-show
- Status tab filters: Needs Review · Attended · No-shows · Cancelled
- Stats: Pending review count · Attended today · No-shows (7 days) · Attendance rate

### ✂️ Services
- Service catalogue with 8 categories (hair, barber, nails, lashes, beauty, massage, wellness, other)
- Fields: name, description, duration, buffer time, price, deposit, status, online booking toggle
- Multi-staff assignment
- Cover image upload
- Category colour coding with fallback colour strips

### 📦 Packages
- Bundle ≥ 2 services into a bookable package
- Auto-calculated total duration + price from included services
- Duration override (custom time)
- Discount: percentage or fixed AUD amount
- Online booking toggle, per-staff eligibility
- Cover image upload with gradient overlay
- Unit-tested calculation utilities (38 tests)

### 🎁 Loyalty Programs
- Multiple sequential programs — clients progress through them one at a time
- Reward types: % discount · AUD discount · Free item · Free visit
- Redemption: own shop or partner shop (with partner name + address)
- Trigger: number of visits **or** amount spent
- Optional expiry date
- Visual journey timeline showing client progression

### 👤 Clients
- Searchable / filterable client list (table format)
- Columns: name, total bookings, last visit, upcoming booking indicator
- Sortable by any column, paginated
- Bulk communication: send email/notification to all, future-booking clients, or staff-specific clients
- Campaign form with audience, channel, message, and optional scheduling

### 💬 Alert System
- Themed toast notifications (success / info / warning / error)
- Promise-based confirmation dialogs (danger / warning / info variants)
- Global via `useToast()` and `useConfirm()` hooks

### 🏪 Store Profile
- Shop name, business type, description, logo upload
- Phone, email, website
- Address with Google Maps live preview (auto-updates as you type)
- Social media links (Instagram, Facebook, TikTok)

### ⚙️ Store Settings
- **Booking window** — how far in advance clients can book (e.g., 4 weeks)
- **Slot interval** — time grid increment (5/10/15/20/30/45/60 min) with live slot preview
- **Holidays & closures** — add custom dates or bulk-import VIC public holidays
- Per-holiday surcharge (% or fixed AUD)
- **Surcharge rules** — weekend / after-hours / custom day+time rules with active toggle
- **Cancellation policy** — minimum notice hours, late-cancellation fee %, policy text with templates
- **Privacy policy** — free-text with template starters

---

## Potential Features (Backlog — Not Yet Built)

These are features identified as likely required by the shops we are targeting.

### Payments & Checkout
- [ ] Stripe / Square integration for online payment at booking
- [ ] Deposit collection at booking confirmation
- [ ] In-store POS / checkout screen with cash, card, and tap-to-pay
- [ ] Split payment (e.g., deposit online + balance in-store)
- [ ] Automatic late-cancellation fee charging
- [ ] Tip management and staff tip reporting
- [ ] Tax invoicing (GST-compliant for Australia)
- [ ] Gift card creation and redemption

### Automated Communications
- [ ] Appointment reminder SMS (configurable: 24h / 2h before)
- [ ] Appointment reminder email with calendar attachment (iCal)
- [ ] Post-appointment review request (SMS/email)
- [ ] Birthday / anniversary messages
- [ ] Re-engagement campaigns ("We miss you" after X weeks)
- [ ] New booking confirmation (client-facing)
- [ ] Cancellation and rescheduling notifications

### Online Booking (Client-Facing)
- [ ] Public booking widget (embeddable on website / Google My Business)
- [ ] Client self-service portal (my bookings, rescheduling, cancellation)
- [ ] Real-time slot availability feed (live, not mock)
- [ ] Multi-service booking in one appointment
- [ ] Staff preference or "any available" option

### Reporting & Analytics
- [ ] Revenue reporting (daily / weekly / monthly / by staff / by service)
- [ ] Rebooking rate and client retention metrics
- [ ] No-show and cancellation rate trends
- [ ] Peak hours and capacity utilisation heatmap
- [ ] Staff performance dashboards
- [ ] Service popularity and average ticket analysis
- [ ] Export to CSV / PDF

### Staff & Roster Management
- [ ] Staff roster planner (drag-and-drop weekly scheduling)
- [ ] Leave management (annual leave, sick leave)
- [ ] Commission tracking and payout reports
- [ ] Staff clock-in / clock-out
- [ ] Staff mobile app (own schedule, upcoming bookings, client notes)

### Client App
- [ ] Native iOS + Android client booking app
- [ ] Push notifications for booking confirmation, reminders, promotions
- [ ] Loyalty points balance and rewards dashboard
- [ ] Booking history and favourite staff/services
- [ ] One-tap rebook last appointment

### Multi-Location & Enterprise
- [ ] Multi-location / franchise support (centralised management, per-branch reporting)
- [ ] Brand-level staff and service templates
- [ ] Cross-location client recognition

### Waitlist & Capacity
- [ ] Waitlist for fully-booked slots — auto-notify when a slot opens
- [ ] Walk-in queue management (digital queue number)
- [ ] Capacity limits per time slot

### Integrations
- [ ] Google Calendar two-way sync
- [ ] Apple Calendar sync
- [ ] Google My Business bookings integration
- [ ] Xero / MYOB integration for accounting
- [ ] Mailchimp / Klaviyo for email marketing automation
- [ ] Meta / Google Ads pixel integration for conversion tracking

### Product / Retail
- [ ] Retail product catalogue (sell products at checkout)
- [ ] Basic inventory management (stock levels, low-stock alerts)
- [ ] Product bundling with services

---

## Immediate Next Features (v0.2 Roadmap)

These are the next features to build to make the product shippable to first customers.

| Priority | Feature | Description |
|---|---|---|
| 🔴 P0 | Real API integration | Replace all mock data with live REST / GraphQL API calls |
| 🔴 P0 | Authentication (real) | JWT / session auth, protected routes, role-based access |
| 🔴 P0 | Online booking widget | Public-facing booking page at `book.getsquire.com/[shopslug]` |
| 🔴 P0 | Payment at booking | Stripe deposit + full payment collection |
| 🟠 P1 | Appointment reminders | Automated SMS/email at configurable lead times |
| 🟠 P1 | Client app (MVP) | React Native app for clients to book and manage appointments |
| 🟠 P1 | Reporting dashboard | Revenue, rebooking, and no-show reports |
| 🟡 P2 | Google Calendar sync | Two-way sync so staff see bookings in their calendar |
| 🟡 P2 | Review requests | Post-visit SMS/email asking for a Google review |
| 🟡 P2 | Waitlist | Auto-fill cancellations from a waitlist |
| 🟡 P2 | Staff mobile app | React Native app for staff to view schedules |

---

## Subscription Model

See **[Pricing](#pricing)** on the landing page (`/`) for the interactive calculator.

### Base Plan — per staff member / month

One plan with everything included. Price scales with your team.

| Staff Count | Monthly Rate (AUD) | Annual Rate (AUD) |
|---|---|---|
| 1 – 5 staff | $67 / staff / mo | $56 / staff / mo |
| 6 – 15 staff | $59 / staff / mo | $49 / staff / mo |
| 16 – 30 staff | $52 / staff / mo | $43 / staff / mo |
| 31+ staff | Contact us | Contact us |

- **First month free** for all new accounts — no credit card required
- Annual billing = ~17% discount (billed as a single yearly payment)
- GST applies to Australian businesses

### What's included in every plan

Every staff tier includes the complete platform:
- Full booking calendar (day / week / month)
- Staff scheduling & availability overrides
- Services, packages, and loyalty programs
- Client management and bulk communication
- Visits & attendance tracking
- Store profile, settings, holidays, and surcharges
- Unlimited in-app push notifications (free)
- Transactional email confirmations (free)

### SMS Credits — top-up bundles (optional)

SMS credits are purchased separately when needed — no monthly subscription.
Credits never expire and work across all SMS types (reminders, confirmations, campaigns).

Pricing reflects Twilio AU carrier delivery costs plus platform infrastructure:

| Bundle | Price (AUD) | Per SMS |
|---|---|---|
| 500 SMS | $80 | $0.160 |
| 1,000 SMS | $149 | $0.149 |
| 2,500 SMS | $349 | $0.140 |
| 5,000 SMS | $649 | $0.130 |
| 10,000 SMS | $1,199 | $0.120 |

> Note: All plans include unlimited free in-app push notifications and email confirmations.
> SMS is an optional top-up for reaching clients who may not have the app installed.

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/           # Login, signup, password reset
│   ├── (dashboard)/      # All authenticated app pages
│   │   ├── bookings/
│   │   ├── clients/
│   │   ├── staff/
│   │   ├── availability/
│   │   ├── visits/
│   │   ├── services/
│   │   ├── packages/
│   │   ├── loyalty/
│   │   ├── dashboard/
│   │   └── settings/
│   │       ├── profile/
│   │       └── store/
│   ├── page.tsx          # Landing / marketing page
│   ├── layout.tsx        # Root layout (fonts, providers)
│   ├── globals.css       # Tailwind + design tokens
│   └── icon.svg          # Browser tab favicon
├── components/
│   ├── dashboard/        # Feature page components
│   ├── landing/          # Marketing page sections
│   ├── layout/           # Sidebar, topbar, auth panel
│   ├── providers/        # App-wide context providers
│   └── ui/               # Primitives (Button, Input, Toggle, ImageUpload…)
├── hooks/                # use-auth, use-toast, use-confirm
├── store/                # Zustand stores (auth, toast, dialog)
├── lib/
│   ├── api/              # API stubs (replace with real calls)
│   ├── mock/             # Mock data for all features
│   ├── utils/            # cn, date, booking-slots, package-calculations
│   └── validations/      # Zod schemas per feature
├── types/                # TypeScript interfaces per domain
├── constants/            # Routes
└── __tests__/            # Unit tests (Jest)
```
