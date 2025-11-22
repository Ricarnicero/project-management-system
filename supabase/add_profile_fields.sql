-- Add phone and alias fields to profiles table
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists alias text;
