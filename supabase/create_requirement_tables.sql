-- Create requirement_documents table
create table if not exists public.requirement_documents (
  id uuid default uuid_generate_v4() primary key,
  requirement_id uuid references public.requirements(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create requirement_audit_logs table
create table if not exists public.requirement_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  requirement_id uuid references public.requirements(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  field_name text not null,
  old_value text,
  new_value text,
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.requirement_documents enable row level security;
alter table public.requirement_audit_logs enable row level security;

-- RLS Policies for requirement_documents
create policy "Authenticated users can view all requirement documents"
  on public.requirement_documents for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert requirement documents"
  on public.requirement_documents for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete requirement documents"
  on public.requirement_documents for delete
  using (auth.role() = 'authenticated');

-- RLS Policies for requirement_audit_logs
create policy "Authenticated users can view all audit logs"
  on public.requirement_audit_logs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert audit logs"
  on public.requirement_audit_logs for insert
  with check (auth.role() = 'authenticated');
