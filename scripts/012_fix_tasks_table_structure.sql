-- Drop existing tasks table and recreate with correct structure
drop table if exists public.tasks cascade;

-- Create tasks table with JSON data field
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  data jsonb not null default '{}',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on data field for better performance
create index if not exists tasks_data_gin_idx on public.tasks using gin (data);

-- Create trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at_column();

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
