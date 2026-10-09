-- Run this in your Supabase SQL Editor to allow direct read/write operations
-- from the portal frontend:

drop policy if exists "Allow read access for authenticated users on profiles" on public.profiles;
drop policy if exists "Allow read access on audit_claims" on public.audit_claims;
drop policy if exists "Allow read access on transactions" on public.transactions;
drop policy if exists "Allow read access on contribution_rules" on public.contribution_rules;
drop policy if exists "Allow read access on member_treat_events" on public.member_treat_events;
drop policy if exists "Allow read access on venues" on public.venues;
drop policy if exists "Allow read access on venue_votes" on public.venue_votes;
drop policy if exists "Allow read access on planned_activities" on public.planned_activities;
drop policy if exists "Allow read access on activity_rsvps" on public.activity_rsvps;
drop policy if exists "Managers can modify audit_claims" on public.audit_claims;
drop policy if exists "Managers can modify transactions" on public.transactions;
drop policy if exists "Users can insert venues" on public.venues;
drop policy if exists "Users can toggle venue votes" on public.venue_votes;
drop policy if exists "Users can log treat events" on public.member_treat_events;
drop policy if exists "Users can RSVP to activities" on public.activity_rsvps;

-- Allow unrestricted read & write for the team portal:
alter table public.profiles disable row level security;
alter table public.audit_claims disable row level security;
alter table public.transactions disable row level security;
alter table public.contribution_rules disable row level security;
alter table public.member_treat_events disable row level security;
alter table public.venues disable row level security;
alter table public.venue_votes disable row level security;
alter table public.planned_activities disable row level security;
alter table public.activity_rsvps disable row level security;
