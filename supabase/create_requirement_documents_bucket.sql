-- Create requirement-documents storage bucket
insert into storage.buckets (id, name, public)
values ('requirement-documents', 'requirement-documents', false)
on conflict (id) do nothing;

-- Set up storage policies for requirement-documents bucket
-- Allow authenticated users to upload documents
create policy "Authenticated users can upload requirement documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'requirement-documents');

-- Allow authenticated users to view documents
create policy "Authenticated users can view requirement documents"
on storage.objects for select
to authenticated
using (bucket_id = 'requirement-documents');

-- Allow authenticated users to update documents
create policy "Authenticated users can update requirement documents"
on storage.objects for update
to authenticated
using (bucket_id = 'requirement-documents');

-- Allow authenticated users to delete documents
create policy "Authenticated users can delete requirement documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'requirement-documents');
