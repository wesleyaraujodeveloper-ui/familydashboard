-- Migration Etapa 8: Funcionalidades Completas de Tarefas

-- 1. Enumeração de Prioridade
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- 2. Adicionando Colunas em Tasks
ALTER TABLE tasks 
  ADD COLUMN description TEXT,
  ADD COLUMN priority task_priority DEFAULT 'medium';

-- 3. Tabela de Checklists
CREATE TABLE task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Comentários (Polimórfica para tarefas, ideias, etc)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type NOT NULL, 
  entity_id UUID NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Segurança RLS: Checklists
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Checklists access"
  ON task_checklists FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_checklists.task_id
      AND public.is_group_member(t.space_id)
    )
  );

-- 6. Segurança RLS: Comentários (Para tarefas)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments access for tasks"
  ON comments FOR ALL USING (
    (entity_type = 'task') AND EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = comments.entity_id
      AND public.is_group_member(t.space_id)
    )
  );

-- Opcional: permissões explícitas para evitar problemas
GRANT ALL ON task_checklists TO authenticated;
GRANT ALL ON comments TO authenticated;
