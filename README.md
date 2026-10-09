# 🏆 TRF Portal (Team Recreational Funds)

A modern, full-stack Next.js web application for managing company **Team Recreational Funds (TRF)**. Built with **Next.js App Router**, **Tailwind CSS**, and designed for seamless deployment on **Vercel** with **Supabase**.

---

## 💡 What is TRF Portal?

Currently, many engineering teams manage recreational funds across disconnected Excel sheets. This portal centralizes and automates the entire lifecycle:
1. **Company Allowance (1,400 PKR / Head / Month)**: Automatically calculates the team allowance based on active headcount, tracks monthly voucher submissions to Internal Audit, and logs disbursed funds straight into the collective pool.
2. **Transparent Collective Funds Ledger**: Complete visibility for every team member into inflows (claims, joining contributions, treats) and outflows (dinners, hi-tea, bowling, birthday cakes).
3. **Role-Based Access Control (RBAC)**:
   - **Team Member**: View collective funds, see planned activities, vote on hangout places, see upcoming birthdays, declare treats, and RSVP to events.
   - **TRF Manager (Admin)**: Full control to log expenses, create and manage monthly audit claims, verify joining fee payments, collect treat dues, and schedule team outings.
4. **New Member Joining Contribution**: Every newly registered teammate is assigned a mandatory joining fee (e.g. 1,000 PKR). The Manager can verify and mark it as collected, which automatically credits the TRF pool.
5. **Milestone Treat & Contribution Rules**: Established guidelines when someone buys a new smartphone/laptop, receives a promotion/appraisal, gets married, or passes a certification.
6. **Birthday Celebrations Module**: Automatic countdown to upcoming teammates' birthdays with cake budget allocations and instant celebration confetti.
7. **Hangouts & Places Wishlist**: Interactive upvoting system for recreational spots (dining, gaming arcades, bowling, outdoor BBQ) and scheduled outings with automated TRF subsidy calculations.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v18+` (or `v24.x`)
- npm `v9+`

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3002` if port 3000 is occupied) in your browser.

> **Zero Setup Demo Mode**: The application is pre-seeded with realistic team data (10 Pakistani engineering teammates, historical audit claims, treat logs, and hangout venues). You can immediately test adding transactions, voting on venues, and switching between **TRF Manager** and **Team Member** using the persona switcher in the top navigation bar!

---

## 🗄️ Supabase Integration

The portal comes with production-ready Supabase database integration and Row Level Security (RLS) policies.

### 1. Run the Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy and run the entire script in [`supabase/schema.sql`](./supabase/schema.sql).

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🚢 Deploying to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: initial TRF portal prototype"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and import it.
4. (Optional) Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
5. Click **Deploy**. Vercel will build and serve your app globally.

---

## 🛠️ Project Structure

```
trf-portal/
├── src/
│   ├── app/
│   │   ├── globals.css         # Dark theme styles & glassmorphism utilities
│   │   ├── layout.tsx          # Root layout with fonts & SEO metadata
│   │   └── page.tsx            # Main application dashboard & views
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Top bar with pool pill & persona switcher
│   │   │   └── Sidebar.tsx     # Desktop navigation with badges
│   │   ├── dashboard/
│   │   │   ├── StatCards.tsx   # 4 high-impact metric cards
│   │   │   ├── AuditClaimBanner.tsx # Current month audit status banner
│   │   │   ├── UpcomingBirthdaysWidget.tsx
│   │   │   ├── PopularVenuesWidget.tsx
│   │   │   └── RecentTransactionsWidget.tsx
│   │   ├── modals/
│   │   │   ├── AddTransactionModal.tsx  # Log expense or inflow
│   │   │   ├── SubmitClaimModal.tsx     # 1,400 PKR/head audit form
│   │   │   ├── AddTreatModal.tsx        # Gadget/promotion treat form
│   │   │   ├── AddVenueModal.tsx        # Suggest venue
│   │   │   └── AddMemberModal.tsx       # Onboard teammate + joining fee
│   │   └── sections/
│   │       ├── OverviewView.tsx
│   │       ├── FundsLedgerView.tsx      # Filterable ledger + CSV export
│   │       ├── AuditClaimsView.tsx      # Audit voucher pipeline & approvals
│   │       ├── BirthdaysView.tsx        # Birthday calendar & countdowns
│   │       ├── ActivitiesVenuesView.tsx # Venues wishlist & planned outings
│   │       ├── RulesTreatsView.tsx      # Guidelines & collected treats
│   │       └── MembersView.tsx          # Team roster & joining fee status
│   ├── context/
│   │   └── TRFContext.tsx      # Global store, calculations & local persistence
│   ├── types/
│   │   └── trf.ts              # Domain TypeScript types
│   └── lib/
│       ├── mock-data.ts        # Pre-seeded Pakistani team demo data
│       ├── utils.ts            # PKR formatting, countdowns & CSV export
│       └── supabase.ts         # Supabase client connector
├── supabase/
│   └── schema.sql              # PostgreSQL tables & RLS policies
├── .env.example
├── package.json
└── README.md
```
