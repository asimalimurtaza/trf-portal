-- =========================================================================
-- TRF Portal: Venue Votes Table Migration & RLS Disable
-- =========================================================================

-- Create the venue_votes table if it does not already exist
create table if not exists public.venue_votes (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid references public.venues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (venue_id, user_id)
);

-- Disable Row Level Security so authenticated portal users can vote & unvote
alter table public.venue_votes disable row level security;

-- Index for speedy lookups
create index if not exists idx_venue_votes_venue_id on public.venue_votes(venue_id);
create index if not exists idx_venue_votes_user_id on public.venue_votes(user_id);
