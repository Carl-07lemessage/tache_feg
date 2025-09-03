-- Create project_members table for managing project team members
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'Membre' check (role in ('Propriétaire', 'Admin', 'Membre', 'Observateur')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Enable RLS
alter table public.project_members enable row level security;

-- RLS policies for project_members
create policy "project_members_select_member"
  on public.project_members for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id and pm.user_id = auth.uid()
    )
  );

create policy "project_members_insert_owner_or_admin"
  on public.project_members for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id 
      and pm.user_id = auth.uid() 
      and pm.role in ('Propriétaire', 'Admin')
    )
  );

create policy "project_members_update_owner_or_admin"
  on public.project_members for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id 
      and pm.user_id = auth.uid() 
      and pm.role in ('Propriétaire', 'Admin')
    )
  );

create policy "project_members_delete_owner_or_admin_or_self"
  on public.project_members for delete
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id 
      and pm.user_id = auth.uid() 
      and pm.role in ('Propriétaire', 'Admin')
    )
  );
