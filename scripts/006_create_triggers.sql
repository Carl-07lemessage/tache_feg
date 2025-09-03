-- Create trigger function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nom, prenom)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nom', null),
    coalesce(new.raw_user_meta_data ->> 'prenom', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger to auto-create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create trigger function to auto-add project owner as member
create or replace function public.handle_new_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'Propriétaire')
  on conflict (project_id, user_id) do nothing;

  return new;
end;
$$;

-- Create trigger to auto-add project owner as member
drop trigger if exists on_project_created on public.projects;
create trigger on_project_created
  after insert on public.projects
  for each row
  execute function public.handle_new_project();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers to relevant tables
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();
