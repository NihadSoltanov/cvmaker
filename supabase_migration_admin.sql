-- ============================================================
-- CViq Admin Panel Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add role column to profiles
alter table profiles add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

-- 2. Add is_paid column to profiles (denormalized for admin queries)
alter table profiles add column if not exists is_paid boolean not null default false;

-- 3. Add ats_score to tailored_outputs (may already exist)
alter table tailored_outputs add column if not exists ats_score int;
alter table tailored_outputs add column if not exists motivation_letter text;

-- 4. Support messages table (user <-> admin real-time chat)
create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  sender text not null check (sender in ('user', 'admin', 'ai')),
  message text not null,
  read_by_admin boolean default false,
  read_by_user boolean default false,
  created_at timestamptz default now()
);

-- 5. Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error', 'message')),
  title text not null,
  body text,
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- 6. Enable RLS
alter table support_messages enable row level security;
alter table notifications enable row level security;

-- 7. RLS Policies for support_messages
-- Users can see their own messages
create policy "Users see own messages"
  on support_messages for select
  using (auth.uid() = user_id);

-- Users can insert their own messages (sender = 'user')
create policy "Users send messages"
  on support_messages for insert
  with check (auth.uid() = user_id and sender = 'user');

-- Admins see all messages
create policy "Admins see all messages"
  on support_messages for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Admins can insert admin/ai messages
create policy "Admins send messages"
  on support_messages for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
    and sender in ('admin', 'ai')
  );

-- Admins can update read status
create policy "Admins update read status"
  on support_messages for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Users can mark messages as read by user
create policy "Users update own read status"
  on support_messages for update
  using (auth.uid() = user_id);

-- 8. RLS Policies for notifications
create policy "Users see own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Admins manage all notifications"
  on notifications for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 9. Enable realtime for support_messages and notifications
alter publication supabase_realtime add table support_messages;
alter publication supabase_realtime add table notifications;

-- 10. Admin read policy for ALL tables (admins can query everything)
create policy "Admins read all profiles"
  on profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins read all resumes"
  on resumes for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins read all tailored outputs"
  on tailored_outputs for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins read all subscriptions"
  on subscriptions for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 11. Make yourself admin (replace with your actual user ID)
-- update profiles set role = 'admin' where email = 'your@email.com';

-- 12. Helper view: admin user stats
create or replace view admin_user_stats as
select
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_paid,
  p.created_at,
  count(distinct r.id) as resume_count,
  count(distinct t.id) as optimization_count,
  max(t.created_at) as last_activity,
  coalesce(sub.plan, 'free') as plan,
  coalesce(sub.status, 'inactive') as sub_status
from profiles p
left join resumes r on r.user_id = p.id
left join tailored_outputs t on t.user_id = p.id
left join subscriptions sub on sub.user_id = p.id
group by p.id, p.email, p.full_name, p.role, p.is_paid, p.created_at, sub.plan, sub.status;
