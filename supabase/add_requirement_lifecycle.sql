-- Add lifecycle date fields to requirements table
alter table public.requirements add column if not exists dev_start_date date;
alter table public.requirements add column if not exists dev_end_date date;
alter table public.requirements add column if not exists internal_delivery_date date;
alter table public.requirements add column if not exists testing_start_date date;
alter table public.requirements add column if not exists testing_end_date date;
alter table public.requirements add column if not exists client_delivery_date date;
