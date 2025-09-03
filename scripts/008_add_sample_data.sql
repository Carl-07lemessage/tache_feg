-- Add more sample tasks with different data
insert into public.tasks (project_id, data, created_by) 
select 
  p.id,
  jsonb_build_object(
    'expeditionDate', '2024-01-20',
    'arrivalDate', '2024-01-21',
    'sender', 'Ministère de l''Économie',
    'subject', 'Demande de partenariat public-privé',
    'instruction', 'Étudier la faisabilité du projet',
    'orderGiver', 'Ministre de l''Économie',
    'deadline', '2024-02-15',
    'rmo', 'RMO-2024-002',
    'receptionDay', '2024-01-20',
    'exitDate', null,
    'observation', 'En cours d''analyse'
  ),
  p.owner_id
from public.projects p
limit 1;

insert into public.tasks (project_id, data, created_by) 
select 
  p.id,
  jsonb_build_object(
    'expeditionDate', '2024-01-10',
    'arrivalDate', '2024-01-11',
    'sender', 'Chambre de Commerce',
    'subject', 'Organisation du forum économique',
    'instruction', 'Coordonner avec les partenaires',
    'orderGiver', 'Président de la Chambre',
    'deadline', '2024-03-01',
    'rmo', 'RMO-2024-003',
    'receptionDay', '2024-01-10',
    'exitDate', '2024-01-28',
    'observation', 'Terminé avec succès'
  ),
  p.owner_id
from public.projects p
limit 1;
