-- Migration: Add share link snapshot support and allow public read
-- Run in Supabase SQL Editor

-- 1. Add missing columns to share_links
alter table share_links
  add column if not exists template_id text,
  add column if not exists resume_snapshot text;

-- 2. Allow tailored_output_id to be NULL (for direct CV sharing)
alter table share_links
  alter column tailored_output_id drop not null;

-- 3. Add RLS policy so ANYONE can read share links by token (for public view page)
drop policy if exists "Public can view share links by token" on share_links;
create policy "Public can view share links by token" on share_links
  for select using (true);

-- 4. Allow users to insert their own share links
drop policy if exists "User owns share_links" on share_links;
create policy "User can manage own share_links" on share_links
  for all using (auth.uid() = user_id);
