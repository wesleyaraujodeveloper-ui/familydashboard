-- Migration Etapa 8: Funcionalidades de Ideias (Ideas)

CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segurança RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ideas access"
  ON ideas FOR ALL USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = ideas.space_id))
  );

GRANT ALL ON ideas TO authenticated;
