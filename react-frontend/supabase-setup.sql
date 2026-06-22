-- ============================================================================
-- Cloud Intelligence Platform — Supabase setup
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor of your NEW project
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- It is idempotent: safe to re-run. It creates the 7 tables the app uses, the
-- auth→profiles trigger, the email_subscribers unique constraint, and RLS
-- policies for every table.
--
-- Schema was RECONSTRUCTED from how the app reads/writes each table — there was
-- no complete migration on disk. Column types marked "inferred" are a best
-- guess from usage; confirm against your old project if you still have access.
--
-- The app talks to the DB three ways, which shaped the policies below:
--   1. Browser, logged-in user, ANON key  → per-user row access (auth.uid()).
--   2. Browser, anonymous visitor, ANON key → public inserts (newsletter,
--      search logging) and the public /stats aggregate reads.
--   3. Server route (send-digest), SERVICE ROLE key → bypasses RLS entirely.
-- ============================================================================

create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- ============================================================================
-- 1. profiles
-- ----------------------------------------------------------------------------
-- One row per auth user. The APP NEVER INSERTS HERE — rows are created by the
-- handle_new_user trigger (section 8) on signup. It only SELECTs/UPDATEs by id.
-- ============================================================================
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  full_name              text,
  plan                   text    not null default 'free',  -- 'free' | 'pro' | 'business'
  ai_queries_today       integer not null default 0,
  queries_reset_date     date,                              -- inferred: daily reset marker (could be timestamptz)
  weekly_digest_enabled  boolean not null default false,
  aws_access_key_id      text,                              -- user-supplied AWS key id
  aws_secret_key         text,                              -- NOTE: app stores this base64-encoded, NOT encrypted
  monthly_spend          numeric,                           -- inferred numeric (USD)
  monthly_budget         numeric,                           -- inferred numeric (USD)
  provider               text,                              -- inferred: user's primary cloud
  industry               text,                              -- inferred
  created_at             timestamptz not null default now()
);

-- ============================================================================
-- 2. saved_recommendations
-- ----------------------------------------------------------------------------
-- Output of the advisor/analyze flows. Read on dashboard, homepage, stats.
-- ============================================================================
create table if not exists public.saved_recommendations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  provider    text,
  confidence  integer,            -- inferred integer (e.g. 0–100 match %)
  workload    text,
  team_size   text,               -- inferred text (stored as a label/range)
  budget      text,               -- inferred text (stored as a label/range)
  created_at  timestamptz not null default now()
);
create index if not exists saved_recommendations_user_id_idx on public.saved_recommendations(user_id);

-- ============================================================================
-- 3. team_invites
-- ----------------------------------------------------------------------------
-- Invites are keyed by the INVITER'S EMAIL (invited_by), not a uuid — the app
-- queries .eq('invited_by', session.user.email). RLS below matches on the JWT
-- email claim accordingly.
-- ============================================================================
create table if not exists public.team_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,                       -- invitee email
  invited_by  text not null,                       -- inviter email (matches auth email)
  status      text not null default 'pending',     -- 'pending' | (others set by app)
  created_at  timestamptz not null default now()
);
create index if not exists team_invites_invited_by_idx on public.team_invites(invited_by);

-- ============================================================================
-- 4. implementation_results
-- ----------------------------------------------------------------------------
-- Logged when a user completes an implementation wizard / quick win.
-- /stats reads `rating` across ALL rows (see optional public-read policy).
-- ============================================================================
create table if not exists public.implementation_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  recommendation text,
  action_taken   text,
  outcome        text,            -- inferred: e.g. 'saved_money'
  saving_amount  numeric,         -- inferred numeric (USD)
  rating         integer,         -- inferred integer (1–5)
  created_at     timestamptz not null default now()
);
create index if not exists implementation_results_user_id_idx on public.implementation_results(user_id);

-- ============================================================================
-- 5. decisions
-- ----------------------------------------------------------------------------
-- Decision journal. App already degrades gracefully if this table is missing,
-- but recreating it restores the feature.
-- ============================================================================
create table if not exists public.decisions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  decision_text    text,
  reasoning        text,
  alternatives     text,            -- inferred text (free-form)
  expected_outcome text,
  review_date      date,            -- inferred date
  outcome          text,            -- set later when reviewed
  status           text not null default 'active',  -- 'active' | 'reviewed'
  tags             text[],          -- app sends an array of trimmed strings
  created_at       timestamptz not null default now()
);
create index if not exists decisions_user_id_idx on public.decisions(user_id);

-- ============================================================================
-- 6. email_subscribers
-- ----------------------------------------------------------------------------
-- Newsletter / weekly-digest signups from anonymous visitors. The app does
-- .upsert(..., { onConflict: 'email' }) so EMAIL MUST BE UNIQUE.
-- ============================================================================
create table if not exists public.email_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,   -- unique constraint required for upsert onConflict
  source      text,                   -- e.g. 'weekly-digest'
  provider    text,                   -- inferred
  spend_range text,                   -- inferred (label/range)
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 7. search_queries
-- ----------------------------------------------------------------------------
-- Global search logging (the one table the old migration file documented).
-- ============================================================================
create table if not exists public.search_queries (
  id             uuid primary key default gen_random_uuid(),
  query          text not null,
  result_found   boolean default true,
  clicked_result text,
  user_id        uuid references auth.users(id) on delete set null,  -- nullable: anon searches allowed
  created_at     timestamptz not null default now()
);

-- ============================================================================
-- 8. handle_new_user trigger  (CRITICAL)
-- ----------------------------------------------------------------------------
-- The app never inserts into profiles, so without this trigger every profile
-- read/update returns nothing and plan gating, query limits, AWS keys, budgets
-- and the digest toggle all silently break. SECURITY DEFINER lets it write to
-- profiles regardless of RLS.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 9. Row-Level Security
-- ----------------------------------------------------------------------------
-- Enable RLS on every table, then add per-table policies. Policies are dropped
-- first so this whole file stays re-runnable.
-- ============================================================================
alter table public.profiles               enable row level security;
alter table public.saved_recommendations  enable row level security;
alter table public.team_invites           enable row level security;
alter table public.implementation_results enable row level security;
alter table public.decisions              enable row level security;
alter table public.email_subscribers      enable row level security;
alter table public.search_queries         enable row level security;

-- ---- profiles: a user can read/update only their own row --------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- (No INSERT policy needed: the SECURITY DEFINER trigger creates the row.
--  Add one only if you ever insert profiles from the client.)

-- ---- saved_recommendations: owner full access ------------------------------
drop policy if exists "saved_recs_own" on public.saved_recommendations;
create policy "saved_recs_own" on public.saved_recommendations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- team_invites: the inviter (matched by email claim) manages their invites
drop policy if exists "team_invites_own" on public.team_invites;
create policy "team_invites_own" on public.team_invites
  for all
  using (invited_by = (auth.jwt() ->> 'email'))
  with check (invited_by = (auth.jwt() ->> 'email'));

-- ---- implementation_results: owner full access -----------------------------
drop policy if exists "impl_results_own" on public.implementation_results;
create policy "impl_results_own" on public.implementation_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- decisions: owner full access ------------------------------------------
drop policy if exists "decisions_own" on public.decisions;
create policy "decisions_own" on public.decisions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- email_subscribers: anonymous newsletter signup (public upsert) --------
-- Upsert needs INSERT and, on conflict, UPDATE. No SELECT policy → rows aren't
-- publicly readable. NOTE: public UPDATE means anyone who knows an email can
-- overwrite that row's source/provider/spend_range. Acceptable for a newsletter
-- list; tighten to service-role-only if that matters to you.
drop policy if exists "email_subs_insert_public" on public.email_subscribers;
create policy "email_subs_insert_public" on public.email_subscribers
  for insert with check (true);

drop policy if exists "email_subs_update_public" on public.email_subscribers;
create policy "email_subs_update_public" on public.email_subscribers
  for update using (true) with check (true);

-- ---- search_queries: anyone can log a search; owners read their own ---------
drop policy if exists "search_insert_public" on public.search_queries;
create policy "search_insert_public" on public.search_queries
  for insert with check (true);

drop policy if exists "search_select_own" on public.search_queries;
create policy "search_select_own" on public.search_queries
  for select using (auth.uid() = user_id);

-- ============================================================================
-- 10. OPTIONAL — public aggregate reads for the /stats page
-- ----------------------------------------------------------------------------
-- /stats and some homepage counters read GLOBAL aggregates with the anon key:
--     supabase.from('saved_recommendations').select('id',{count:'exact',head:true})
--     supabase.from('implementation_results').select('rating')   // all rows
-- The owner-scoped SELECT policies above make those return 0 / only-own-rows.
--
-- If you want the public stats to show real platform-wide numbers, UNCOMMENT
-- the two policies below. Trade-off: this makes those tables publicly readable
-- (row data like workload/budget/rating becomes world-readable via the anon
-- key). Leave commented to keep that data private (stats will under-count).
--
-- drop policy if exists "saved_recs_public_read" on public.saved_recommendations;
-- create policy "saved_recs_public_read" on public.saved_recommendations
--   for select using (true);
--
-- drop policy if exists "impl_results_public_read" on public.implementation_results;
-- create policy "impl_results_public_read" on public.implementation_results
--   for select using (true);
-- ============================================================================

-- Done. After running: create a test user via the app's /auth signup and
-- confirm a matching row appears in public.profiles (verifies the trigger).
