-- Update default columns to match user specifications
DELETE FROM project_columns WHERE project_id IN (SELECT id FROM projects);

-- Insert the exact columns specified by the user
INSERT INTO project_columns (project_id, column_id, name, type, visible, position) 
SELECT 
  p.id,
  col.column_id,
  col.name,
  col.type,
  col.visible,
  col.position
FROM projects p
CROSS JOIN (
  VALUES 
    ('expeditionDate', 'Date d''expédition', 'date', true, 1),
    ('arrivalDate', 'Date d''arrivée', 'date', true, 2),
    ('sender', 'Expéditeur', 'text', true, 3),
    ('subject', 'Objet', 'text', true, 4),
    ('instruction', 'Instruction', 'text', true, 5),
    ('orderGiver', 'Donneur d''ordre', 'text', true, 6),
    ('deadline', 'Date limite', 'date', true, 7),
    ('rmo', 'RMO', 'text', true, 8),
    ('receptionDay', 'Jour de réception', 'date', true, 9),
    ('exitDate', 'Date de sortie', 'date', true, 10),
    ('observation', 'Observation', 'text', true, 11)
) AS col(column_id, name, type, visible, position);

-- Update the trigger to use these exact columns for new projects
CREATE OR REPLACE FUNCTION initialize_project_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_columns (project_id, column_id, name, type, visible, position) VALUES
    (NEW.id, 'expeditionDate', 'Date d''expédition', 'date', true, 1),
    (NEW.id, 'arrivalDate', 'Date d''arrivée', 'date', true, 2),
    (NEW.id, 'sender', 'Expéditeur', 'text', true, 3),
    (NEW.id, 'subject', 'Objet', 'text', true, 4),
    (NEW.id, 'instruction', 'Instruction', 'text', true, 5),
    (NEW.id, 'orderGiver', 'Donneur d''ordre', 'text', true, 6),
    (NEW.id, 'deadline', 'Date limite', 'date', true, 7),
    (NEW.id, 'rmo', 'RMO', 'text', true, 8),
    (NEW.id, 'receptionDay', 'Jour de réception', 'date', true, 9),
    (NEW.id, 'exitDate', 'Date de sortie', 'date', true, 10),
    (NEW.id, 'observation', 'Observation', 'text', true, 11);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
