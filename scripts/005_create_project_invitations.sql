-- Create project_invitations table for email-based sharing
create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  role text not null default 'Membre' check (role in ('Admin', 'Membre', 'Observateur')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'En attente' check (status in ('En attente', 'Accepté', 'Refusé', 'Expiré')),
  token uuid not null default gen_random_uuid(),
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days') not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, email)
);

-- Enable RLS
alter table public.project_invitations enable row level security;

-- RLS policies for project_invitations
create policy "invitations_select_project_member"
  on public.project_invitations for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_invitations.project_id 
      and pm.user_id = auth.uid() 
      and pm.role in ('Propriétaire', 'Admin')
    )
  );

create policy "invitations_insert_owner_or_admin"
  on public.project_invitations for insert
  with check (
    auth.uid() = invited_by and (
      exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
      ) or
      exists (
        select 1 from public.project_members pm
        where pm.project_id = project_invitations.project_id 
        and pm.user_id = auth.uid() 
        and pm.role in ('Propriétaire', 'Admin')
      )
    )
  );

create policy "invitations_update_owner_or_admin"
  on public.project_invitations for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_invitations.project_id 
      and pm.user_id = auth.uid() 
      and pm.role in ('Propriétaire', 'Admin')
    )
  );

create policy "invitations_delete_owner_or_admin"
  on public.project_invitations for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_invitations.project_id 
      and pm.user_id = auth.uid() 
      and pm.role in ('Propriétaire', 'Admin')
    )
  );
