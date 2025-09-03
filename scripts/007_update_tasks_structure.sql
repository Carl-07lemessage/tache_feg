-- Drop existing tasks table and recreate with frontend-compatible structure
drop table if exists public.tasks cascade;

-- Create tasks table compatible with frontend structure
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  data jsonb not null default '{}',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better performance
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_data_gin_idx on public.tasks using gin(data);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS policies for tasks - users can only see tasks from projects they are members of
create policy "tasks_select_project_member"
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
    )
  );

create policy "tasks_insert_project_member"
  on public.tasks for insert
  with check (
    auth.uid() = created_by and (
      exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
      ) or
      exists (
        select 1 from public.project_members pm
        where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
      )
    )
  );

create policy "tasks_update_project_member"
  on public.tasks for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
    )
  );

create policy "tasks_delete_creator_or_owner"
  on public.tasks for delete
  using (
    created_by = auth.uid() or
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.owner_id = auth.uid()
    )
  );

-- Insert some sample data for testing
insert into public.tasks (project_id, data, created_by) 
select 
  p.id,
  jsonb_build_object(
    'expeditionDate', '2024-01-15',
    'arrivalDate', '2024-01-16',
    'sender', 'Direction Générale',
    'subject', 'Rapport mensuel des activités',
    'instruction', 'Analyser et préparer le rapport de synthèse',
    'orderGiver', 'Directeur Général',
    'deadline', '2024-01-30',
    'rmo', 'RMO-2024-001',
    'receptionDay', '2024-01-15',
    'exitDate', '2024-01-25',
    'observation', 'Priorité haute - délai serré'
  ),
  p.owner_id
from public.projects p
limit 1;
