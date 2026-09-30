-- Migration Etapa 8: Status Universal (Kanban)

-- 1. Remove a tipagem restrita (ENUM) do status das tasks para suportar nosso novo modelo universal
ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN status TYPE TEXT USING status::TEXT;
DROP TYPE task_status;

-- 2. Update tasks from 'pending' to 'todo' and 'completed' to 'done' para o novo padrao Kanban
UPDATE tasks SET status = 'todo' WHERE status = 'pending';
UPDATE tasks SET status = 'done' WHERE status = 'completed';
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'todo';

-- 3. Adiciona status universal nas outras entidades
ALTER TABLE notices ADD COLUMN status TEXT DEFAULT 'todo';
ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'todo';
ALTER TABLE lists ADD COLUMN status TEXT DEFAULT 'todo';
ALTER TABLE ideas ADD COLUMN status TEXT DEFAULT 'todo';
