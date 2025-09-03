-- Allow anonymous access to app_config for public configuration
drop policy if exists "Authenticated users can read app config" on public.app_config;

create policy "Anyone can read app config" on public.app_config
  for select using (true);
