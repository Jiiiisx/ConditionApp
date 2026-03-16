-- 1. Create Profiles Table (Public info about users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  avatar_url text,
  reputation_score integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Incidents Table (The Hero Pins on the map)
-- Uses PostGIS for location (optional, but good for performance)
create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  category text not null, -- FIRE, ACCIDENT, TRAFFIC, etc.
  latitude float8 not null,
  longitude float8 not null,
  priority_score integer default 50,
  status text default 'ACTIVE', -- ACTIVE, RESOLVED, EXPIRED
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Reports Table (Specific reports with media)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incidents on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  description text,
  media_url text,
  media_type text, -- IMAGE, VIDEO
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incidents on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.reports enable row level security;
alter table public.comments enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Incidents are viewable by everyone." on public.incidents for select using (true);
create policy "Authenticated users can insert reports." on public.reports for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can insert comments." on public.comments for insert with check (auth.role() = 'authenticated');
