-- ========================================================
-- Optional: Birthday Wishes Table for TRF Portal
-- ========================================================
-- Note: Realtime birthday confetti works immediately over Supabase 
-- Realtime Broadcast without requiring this table.
-- Run this script in the Supabase SQL editor if you also wish 
-- to persist historical birthday wishes across database refreshes.

create table if not exists public.birthday_wishes (
  id uuid default gen_random_uuid() primary key,
  recipient_id text not null,
  recipient_name text not null,
  sender_id text not null,
  sender_name text not null,
  sender_avatar text,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for quick lookups by recipient and date
create index if not exists idx_birthday_wishes_recipient on public.birthday_wishes(recipient_id);
create index if not exists idx_birthday_wishes_created_at on public.birthday_wishes(created_at);

-- Row Level Security
alter table public.birthday_wishes enable row level security;

create policy "Allow read access to birthday_wishes for all authenticated users"
  on public.birthday_wishes for select to authenticated
  using (true);

create policy "Allow authenticated users to insert birthday_wishes"
  on public.birthday_wishes for insert to authenticated
  with check (true);
