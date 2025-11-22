-- Create Clients Table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Clients
alter table public.clients enable row level security;

-- RLS Policies for Clients
create policy "Authenticated users can view all clients." on public.clients for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert clients." on public.clients for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update clients." on public.clients for update using (auth.role() = 'authenticated');

-- Add client_id to Projects
alter table public.projects add column client_id uuid references public.clients(id) on delete cascade;

-- Add client_id to Requirements and make project_id nullable
alter table public.requirements add column client_id uuid references public.clients(id) on delete cascade;
alter table public.requirements alter column project_id drop not null;
