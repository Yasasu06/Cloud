# Cloud Intelligence Platform

Cloud cost exploration demo for service-level billing analysis and compute-price comparison.

## Demo

https://cloud-psx9.vercel.app

The public demo accepts compatible billing CSVs for AWS, Azure, GCP, DigitalOcean, and Oracle, with a generic cost/service-column fallback. It calculates totals and service shares from the supplied rows. Visitors can also paste bill text. PDF invoices are not parsed. Uploaded CSVs are read in the browser; the bill advice request sends summarized service totals to Groq.

Optimization suggestions and savings figures are estimates or model-generated hypotheses. The app does not inspect resource utilization, verify realized savings, or connect directly to AWS billing accounts. The demo scenario and result preview use illustrative figures; this repository does not establish a customer engagement or production adoption.

The pricing explorer compares selected compute instances across 12 providers. AWS and Azure may return live prices for selected instances and use static fallbacks when those requests fail. GCP and the remaining providers use bundled reference prices. Returned prices, live API responses, and LLM output can vary; verify any financial decision with the provider.

## Architecture

- Next.js 14 App Router, React, TypeScript, Tailwind, Recharts
- Six API routes for AI, selected AWS pricing, email, digest, and a disabled checkout endpoint
- Supabase Auth and Postgres for signed-in user records; anonymous bill history stays in browser storage
- Groq Llama 3.3 70B for advisory text when configured
- A separate historical Streamlit prototype in `app.py`

The tracked Supabase setup defines **eight** application tables with RLS policies. It was reconstructed from application usage and does not prove the schema currently deployed to Supabase. Apply and verify it in a test project before relying on persistence. The public demo does not offer paid subscriptions, performance billing, or a guaranteed free-tier quota.

## Local setup

Use Node 22 and the tracked lockfile:

```sh
cd react-frontend
npm ci
cp .env.example .env.local
npm run dev
```

The `.env.example` file lists variable names only. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `GROQ_API_KEY` for Supabase-backed and AI functions. `NEXT_PUBLIC_GCP_API_KEY` is optional for a catalog availability probe; returned GCP instance prices remain static. `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `DIGEST_ADMIN_TOKEN` are optional server settings for email and admin-triggered digest delivery. Stripe variable names are retained for configuration reference, but the checkout endpoint is disabled until subscription fulfillment exists. `NEXT_PUBLIC_APP_URL` is reserved for app redirects. Keep secret keys server-side. Never configure a `NEXT_PUBLIC_GROQ_API_KEY`.

## Checks

```sh
cd react-frontend
npm test
npm run lint
npm run build
```

The CI workflow runs these checks without paid API calls. Deployment also requires Vercel project settings and an independently provisioned Supabase project; a fresh clone does not reproduce production database state or third-party credentials.

See [DECISIONS.md](DECISIONS.md) for design history.
