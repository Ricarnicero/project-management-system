-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enums
create type area_type as enum ('dev', 'qa', 'support', 'admin');
create type project_status as enum ('active', 'completed', 'on_hold', 'archived');
create type requirement_status as enum ('pending', 'in_progress', 'completed', 'blocked');
create type priority_level as enum ('low', 'medium', 'high', 'critical');
create type doc_type as enum ('technical', 'functional', 'user_manual', 'other');
create type alert_type as enum ('info', 'warning', 'error', 'success');

-- Create Users Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role area_type default 'dev',
  avatar_url text,
  updated_at timestamp with time zone
);

-- Create Clients Table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade, -- Added client_id
  name text not null,
  description text,
  status project_status default 'active',
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Requirements Table
create table public.requirements (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade, -- Added client_id
  project_id uuid references public.projects(id) on delete cascade, -- Made nullable (removed not null)
  title text not null,
  description text,
  status requirement_status default 'pending',
  assigned_to uuid references public.profiles(id),
  area area_type not null,
  priority priority_level default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Documentation Table
create table public.documentation (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  content text,
  type doc_type default 'other',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Alerts Table
create table public.alerts (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  message text not null,
  type alert_type default 'info',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.clients enable row level security; -- Added
alter table public.projects enable row level security;
alter table public.requirements enable row level security;
alter table public.documentation enable row level security;
alter table public.alerts enable row level security;

-- Create Policies (Simple policies for MVP: authenticated users can do everything)
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Authenticated users can view all clients." on public.clients for select using (auth.role() = 'authenticated'); -- Added
create policy "Authenticated users can insert clients." on public.clients for insert with check (auth.role() = 'authenticated'); -- Added
create policy "Authenticated users can update clients." on public.clients for update using (auth.role() = 'authenticated'); -- Added

create policy "Authenticated users can view all projects." on public.projects for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert projects." on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update projects." on public.projects for update using (auth.role() = 'authenticated');

create policy "Authenticated users can view all requirements." on public.requirements for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert requirements." on public.requirements for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update requirements." on public.requirements for update using (auth.role() = 'authenticated');

create policy "Authenticated users can view all documentation." on public.documentation for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert documentation." on public.documentation for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can view all alerts." on public.alerts for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert alerts." on public.alerts for insert with check (auth.role() = 'authenticated');

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'dev');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
