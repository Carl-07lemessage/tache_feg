-- Table pour la configuration globale de l'application
create table if not exists public.app_config (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table pour les colonnes personnalisées par projet
create table if not exists public.project_columns (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  column_id text not null,
  name text not null,
  type text not null check (type in ('text', 'select', 'multiselect', 'date', 'checkbox', 'number', 'person')),
  options jsonb default '[]'::jsonb,
  visible boolean default true,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, column_id)
);

-- RLS pour project_columns
alter table public.project_columns enable row level security;

create policy "Users can view project columns for their projects" on public.project_columns
  for select using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_columns.project_id
      and pm.user_id = auth.uid()
    )
  );

create policy "Project admins can manage project columns" on public.project_columns
  for all using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_columns.project_id
      and pm.user_id = auth.uid()
      and pm.role in ('Propriétaire', 'Admin')
    )
  );

-- RLS pour app_config (lecture seule pour tous les utilisateurs authentifiés)
alter table public.app_config enable row level security;

create policy "Authenticated users can read app config" on public.app_config
  for select using (auth.role() = 'authenticated');

-- Insérer la configuration par défaut
insert into public.app_config (key, value, description) values
  ('app_name', '"Tableau de Bord FEG"', 'Nom de l''application'),
  ('organization_name', '"Fédération des Entreprises du Gabon"', 'Nom de l''organisation'),
  ('organization_short', '"FEG"', 'Nom court de l''organisation'),
  ('logo_url', '"/images/logo-feg.png"', 'URL du logo'),
  ('default_columns', '[
    {"id": "expeditionDate", "name": "Date d''expédition", "type": "date", "visible": true, "position": 0},
    {"id": "arrivalDate", "name": "Date d''arrivée", "type": "date", "visible": true, "position": 1},
    {"id": "sender", "name": "Expéditeur", "type": "text", "visible": true, "position": 2},
    {"id": "subject", "name": "Objet", "type": "text", "visible": true, "position": 3},
    {"id": "instruction", "name": "Instruction", "type": "text", "visible": true, "position": 4},
    {"id": "orderGiver", "name": "Donneur d''ordre", "type": "text", "visible": true, "position": 5},
    {"id": "deadline", "name": "Date limite", "type": "date", "visible": true, "position": 6},
    {"id": "rmo", "name": "RMO", "type": "text", "visible": true, "position": 7},
    {"id": "receptionDay", "name": "Jour de réception", "type": "date", "visible": true, "position": 8},
    {"id": "exitDate", "name": "Date de sortie", "type": "date", "visible": true, "position": 9},
    {"id": "observation", "name": "Observation", "type": "text", "visible": true, "position": 10}
  ]', 'Colonnes par défaut pour les nouveaux projets')
on conflict (key) do nothing;

-- Fonction pour initialiser les colonnes par défaut pour un nouveau projet
create or replace function initialize_project_columns()
returns trigger as $$
declare
  default_cols jsonb;
  col jsonb;
begin
  -- Récupérer les colonnes par défaut
  select value into default_cols 
  from public.app_config 
  where key = 'default_columns';
  
  -- Insérer chaque colonne par défaut
  for col in select * from jsonb_array_elements(default_cols)
  loop
    insert into public.project_columns (
      project_id, 
      column_id, 
      name, 
      type, 
      options, 
      visible, 
      position
    ) values (
      new.id,
      col->>'id',
      col->>'name',
      col->>'type',
      coalesce(col->'options', '[]'::jsonb),
      coalesce((col->>'visible')::boolean, true),
      coalesce((col->>'position')::integer, 0)
    );
  end loop;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour initialiser les colonnes lors de la création d'un projet
create trigger initialize_project_columns_trigger
  after insert on public.projects
  for each row execute function initialize_project_columns();
