-- ========================================================
-- Team Recreational Funds (TRF) Portal Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  employee_id text,
  name text not null,
  role text not null default 'member' check (role in ('manager', 'member')),
  avatar_url text,
  department text default 'Engineering',
  designation text default 'Team Member',
  joining_date date default current_date,
  birth_date date,
  joining_fee_status text default 'pending' check (joining_fee_status in ('paid', 'pending', 'waived')),
  joining_fee_amount numeric default 1000,
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Audit Claims Table (Company TRF 1,400 PKR per head per month)
create table if not exists public.audit_claims (
  id uuid default gen_random_uuid() primary key,
  month_year text not null, -- e.g. "October 2026"
  headcount integer not null default 1,
  rate_per_head numeric not null default 1400,
  total_amount numeric generated always as (headcount * rate_per_head) stored,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved_disbursed', 'rejected')),
  submission_date date,
  disbursed_date date,
  claim_ref_number text,
  audit_notes text,
  submitted_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Transactions / Funds Ledger
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  amount numeric not null,
  type text not null check (type in ('inflow', 'outflow')),
  category text not null check (category in (
    'company_claim',
    'joining_fee',
    'treat_event',
    'fine_penalty',
    'team_dinner',
    'team_lunch',
    'snacks_refreshment',
    'birthday_cake',
    'activity_outing',
    'miscellaneous'
  )),
  date date default current_date not null,
  logged_by uuid references public.profiles(id),
  related_member_id uuid references public.profiles(id),
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Contribution Rules (Treats & Fines)
create table if not exists public.contribution_rules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  suggested_amount numeric not null default 1000,
  icon text default 'Gift',
  is_mandatory boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Member Treat Events
create table if not exists public.member_treat_events (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.profiles(id) not null,
  rule_title text not null,
  details text,
  amount numeric not null default 1000,
  date date default current_date not null,
  status text not null default 'pending' check (status in ('pending', 'collected')),
  collected_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Venues / Hangout Places Wishlist
create table if not exists public.venues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null default 'restaurant' check (category in ('restaurant', 'cafe', 'adventure', 'gaming', 'outdoor')),
  location text not null,
  estimated_cost_per_head numeric default 1500,
  rating numeric default 4.5,
  description text,
  maps_url text,
  status text default 'wishlist' check (status in ('wishlist', 'planned', 'visited')),
  suggested_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Venue Upvotes
create table if not exists public.venue_votes (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid references public.venues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (venue_id, user_id)
);

-- 8. Planned Activities
create table if not exists public.planned_activities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  venue_id uuid references public.venues(id),
  venue_name text not null,
  date date not null,
  time text,
  estimated_total_budget numeric default 0,
  trf_contribution_share numeric default 0,
  personal_contribution_per_head numeric default 0,
  status text default 'voting' check (status in ('voting', 'confirmed', 'completed', 'cancelled')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Activity RSVPs
create table if not exists public.activity_rsvps (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.planned_activities(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'going' check (status in ('going', 'maybe', 'not_going')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (activity_id, user_id)
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

alter table public.profiles enable row level security;
alter table public.audit_claims enable row level security;
alter table public.transactions enable row level security;
alter table public.contribution_rules enable row level security;
alter table public.member_treat_events enable row level security;
alter table public.venues enable row level security;
alter table public.venue_votes enable row level security;
alter table public.planned_activities enable row level security;
alter table public.activity_rsvps enable row level security;

-- Readable by all authenticated team members
create policy "Allow read access for authenticated users on profiles" 
  on public.profiles for select to authenticated using (true);

create policy "Allow read access on audit_claims" 
  on public.audit_claims for select to authenticated using (true);

create policy "Allow read access on transactions" 
  on public.transactions for select to authenticated using (true);

create policy "Allow read access on contribution_rules" 
  on public.contribution_rules for select to authenticated using (true);

create policy "Allow read access on member_treat_events" 
  on public.member_treat_events for select to authenticated using (true);

create policy "Allow read access on venues" 
  on public.venues for select to authenticated using (true);

create policy "Allow read access on venue_votes" 
  on public.venue_votes for select to authenticated using (true);

create policy "Allow read access on planned_activities" 
  on public.planned_activities for select to authenticated using (true);

create policy "Allow read access on activity_rsvps" 
  on public.activity_rsvps for select to authenticated using (true);

-- Manager permissions: only manager role can insert/update audit claims and financial transactions
create policy "Managers can modify audit_claims" 
  on public.audit_claims for all to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'manager'));

create policy "Managers can modify transactions" 
  on public.transactions for all to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'manager'));

-- Users can vote and suggest venues
create policy "Users can insert venues" 
  on public.venues for insert to authenticated with check (true);

create policy "Users can toggle venue votes" 
  on public.venue_votes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can log treat events" 
  on public.member_treat_events for insert to authenticated with check (auth.uid() = member_id);

create policy "Users can RSVP to activities" 
  on public.activity_rsvps for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 10. Direct Messages (1-on-1 In-App Team Chat)
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_direct_messages_participants on public.direct_messages(sender_id, receiver_id);
create index if not exists idx_direct_messages_created_at on public.direct_messages(created_at);

alter table public.direct_messages enable row level security;

create policy "Allow participants to read direct messages" 
  on public.direct_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Allow sender to insert direct messages" 
  on public.direct_messages for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "Allow receiver to update read status" 
  on public.direct_messages for update to authenticated
  using (auth.uid() = receiver_id);
