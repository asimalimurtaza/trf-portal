-- =========================================================================
-- TRF Portal: 2 Test Users for Real-Time Birthday Feature Testing
-- Run this script in the Supabase SQL Editor (Development Project)
-- =========================================================================
-- Credentials created:
-- 1) Birthday User (Has Birthday TODAY!):
--    Email:    birthday.user@company.com
--    Password: TestPass123!
--
-- 2) Teammate User (Sends the celebration wish & confetti):
--    Email:    teammate.user@company.com
--    Password: TestPass123!
-- =========================================================================

-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

do $$
declare
  v_birthday_user_id uuid := 'a1111111-1111-1111-1111-111111111111';
  v_teammate_user_id uuid := 'b2222222-2222-2222-2222-222222222222';
  v_password_hash text := crypt('TestPass123!', gen_salt('bf'));
begin

  -- -----------------------------------------------------------------------
  -- 1. Create or Update in auth.users
  -- -----------------------------------------------------------------------

  -- 1a. Birthday Person (Birthday is TODAY!)
  if exists (select 1 from auth.users where email = 'birthday.user@company.com') then
    update auth.users
    set encrypted_password = v_password_hash,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where email = 'birthday.user@company.com'
    returning id into v_birthday_user_id;
  else
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      v_birthday_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'birthday.user@company.com',
      v_password_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Zainab Birthday"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  end if;

  -- 1b. Teammate (Sender who celebrates)
  if exists (select 1 from auth.users where email = 'teammate.user@company.com') then
    update auth.users
    set encrypted_password = v_password_hash,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where email = 'teammate.user@company.com'
    returning id into v_teammate_user_id;
  else
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      v_teammate_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'teammate.user@company.com',
      v_password_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Hamza Teammate"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  end if;

  -- -----------------------------------------------------------------------
  -- 2. Create or Update public.profiles
  -- -----------------------------------------------------------------------

  -- 2a. Birthday User Profile (Birth Date matches TODAY's date!)
  insert into public.profiles (
    id,
    email,
    employee_id,
    name,
    role,
    avatar_url,
    department,
    designation,
    birth_date,
    joining_fee_status,
    joining_fee_amount,
    phone,
    is_active
  ) values (
    v_birthday_user_id,
    'birthday.user@company.com',
    'TL-9001',
    'Zainab Birthday',
    'member',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'Engineering',
    'Senior Frontend Engineer',
    (current_date - interval '26 years')::date, -- Exactly TODAY's month & day!
    'paid',
    1000,
    '+92 300 1112233',
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    employee_id = excluded.employee_id,
    avatar_url = excluded.avatar_url,
    birth_date = excluded.birth_date,
    is_active = true;

  -- 2b. Teammate User Profile
  insert into public.profiles (
    id,
    email,
    employee_id,
    name,
    role,
    avatar_url,
    department,
    designation,
    birth_date,
    joining_fee_status,
    joining_fee_amount,
    phone,
    is_active
  ) values (
    v_teammate_user_id,
    'teammate.user@company.com',
    'TL-9002',
    'Hamza Teammate',
    'member',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'Engineering',
    'Full Stack Engineer',
    '1997-04-15'::date,
    'paid',
    1000,
    '+92 300 4445566',
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    employee_id = excluded.employee_id,
    avatar_url = excluded.avatar_url,
    birth_date = excluded.birth_date,
    is_active = true;

end $$;
