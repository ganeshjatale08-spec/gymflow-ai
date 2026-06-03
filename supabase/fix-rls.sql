-- ============================================================
-- Fix RLS — Single gym setup mein anon access allow karo
-- Supabase SQL Editor mein yeh run karo
-- ============================================================

-- Conversations table — anon bhi read/write kar sake
drop policy if exists "authenticated_all" on conversations;
create policy "allow_all" on conversations for all using (true) with check (true);

-- Messages table — anon bhi read/write kar sake
drop policy if exists "authenticated_all" on messages;
create policy "allow_all" on messages for all using (true) with check (true);

-- Leads table
drop policy if exists "authenticated_all" on leads;
create policy "allow_all" on leads for all using (true) with check (true);

-- Members table
drop policy if exists "authenticated_all" on members;
create policy "allow_all" on members for all using (true) with check (true);

-- Payments table
drop policy if exists "authenticated_all" on payments;
create policy "allow_all" on payments for all using (true) with check (true);

-- Gym settings table
drop policy if exists "authenticated_all" on gym_settings;
create policy "allow_all" on gym_settings for all using (true) with check (true);

-- Activity log table
drop policy if exists "authenticated_all" on activity_log;
create policy "allow_all" on activity_log for all using (true) with check (true);
