-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  statut text not null default 'En cours' check (statut in ('En cours', 'Terminé', 'En attente', 'Annulé')),
  date_debut date,
  date_fin date,
  budget numeric(12,2),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- RLS policies for projects - users can only see projects they own or are members of
create policy "projects_select_member"
  on public.projects for select
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = projects.id and pm.user_id = auth.uid()
    )
  );

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "projects_update_owner"
  on public.projects for update
  using (auth.uid() = owner_id);

create policy "projects_delete_owner"
  on public.projects for delete
  using (auth.uid() = owner_id);
