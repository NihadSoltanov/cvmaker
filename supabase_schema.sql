-- Enable UUIDs
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key,
  email text,
  full_name text,
  lang text default 'en',
  created_at timestamptz default now()
);

create table if not exists resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null default 'Main CV',
  resume_json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists job_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  job_title text,
  company text,
  job_url text,
  jd_text text not null,
  extracted_json jsonb,
  created_at timestamptz default now()
);

create table if not exists tailored_outputs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  resume_id uuid references resumes(id) on delete set null,
  job_post_id uuid references job_posts(id) on delete set null,
  output_language text not null,
  tone text not null,
  tailored_resume_json jsonb not null,
  cover_letter text not null,
  application_text text not null,
  linkedin_messages jsonb not null,
  ats_keywords_used jsonb,
  missing_requirements jsonb,
  suggestions jsonb,
  created_at timestamptz default now()
);

create table if not exists pdf_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  tailored_output_id uuid references tailored_outputs(id) on delete cascade,
  r2_key text not null,
  template_id text not null,
  page_size text not null,
  created_at timestamptz default now()
);

create table if not exists share_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  tailored_output_id uuid references tailored_outputs(id) on delete cascade,
  token text unique not null,
  visibility text not null default 'unlisted',
  expires_at timestamptz,
  revoked_at timestamptz,
  views int not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists usage_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  feature text not null,
  count int not null default 1,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table resumes enable row level security;
alter table job_posts enable row level security;
alter table tailored_outputs enable row level security;
alter table pdf_files enable row level security;
alter table share_links enable row level security;
alter table subscriptions enable row level security;
alter table usage_events enable row level security;

-- Policies (basic)
create policy "Profiles are viewable by owner" on profiles
  for select using (auth.uid() = id);

create policy "Profiles are editable by owner" on profiles
  for update using (auth.uid() = id);

create policy "User owns resumes" on resumes
  for all using (auth.uid() = user_id);

create policy "User owns job_posts" on job_posts
  for all using (auth.uid() = user_id);

create policy "User owns tailored_outputs" on tailored_outputs
  for all using (auth.uid() = user_id);

create policy "User owns pdf_files" on pdf_files
  for all using (auth.uid() = user_id);

create policy "User owns share_links" on share_links
  for all using (auth.uid() = user_id);

create policy "User owns subscriptions" on subscriptions
  for all using (auth.uid() = user_id);

create policy "User owns usage_events" on usage_events
  for all using (auth.uid() = user_id);
