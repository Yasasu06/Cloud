# Cloud Intelligence Platform

Vendor-neutral AI-powered cloud advisor for startups, founders, and small teams.

## Live Demo
https://cloud-psx9.vercel.app

## Status
**Paused — Strategic Repositioning**

This project was built as a comprehensive cloud cost optimization and advisory platform. After completing 46 pages and full feature set, competitive analysis revealed the SMB cloud cost space is mature with established players (Vantage, CloudHealth, ProsperOps, Vanta, etc.). Project paused to evaluate strategic direction.

## What's Built

- **AI Analysis** — 3-mode analysis (FinOps, Architecture, Migration) with visual JSON output
- **Decision Framework** — Risk profiles, counter-arguments, 4 expert perspectives
- **Outcome Simulator** — Visual journey from current state to optimized state
- **Live Pricing** — Real-time data from AWS, Azure, GCP + 9 verified providers
- **6 Hubs** — Cost Intelligence, Optimize, Migrate, Intelligence, Learn, For Consultants
- **Trust System** — Confidence indicators, transparent calculations, citations
- **Business Features** — 4 pricing tiers, performance pricing, white label reports, expert marketplace

## Tech Stack

- Next.js 14 with TypeScript
- Tailwind CSS with custom design system
- Supabase (auth + database with RLS)
- Stripe (payments, test mode)
- Groq API (Llama 3.3 70B for AI)
- Resend (transactional email)
- Vercel (hosting)
- Recharts (data visualization)

## Architecture

- 46 statically generated pages
- 6 hubs with embedded tools via URL params
- 20 reusable tool components
- 8 Supabase tables with row-level security
- Smart router for query-based navigation
- Plain English mode toggle for non-technical users

## Setup

```bash
cd react-frontend
npm install
npm run dev
```

Required environment variables in `.env.local`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_GROQ_API_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- RESEND_API_KEY
- NEXT_PUBLIC_GCP_API_KEY (optional)

## Key Decisions

See `DECISIONS.md` for architectural decisions and reasoning.

## Author

Yasaswi Dutta
