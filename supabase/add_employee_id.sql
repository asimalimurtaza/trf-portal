-- Migration: Add employee_id to profiles table
-- Run this single command in your Supabase SQL Editor:

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_id text;
