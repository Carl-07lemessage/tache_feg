-- Remove all sample/test data and replace with clean structure
delete from public.tasks where data::text like '%Ministère de l''Économie%' or data::text like '%Chambre de Commerce%';

-- Add a trigger to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_app_config_updated_at before update on public.app_config
  for each row execute function update_updated_at_column();

create trigger update_project_columns_updated_at before update on public.project_columns
  for each row execute function update_updated_at_column();
