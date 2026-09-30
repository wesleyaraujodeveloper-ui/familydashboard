-- Migration Etapa 8: Funcionalidades de Recados (Notices)

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segurança RLS: Recados
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notices access"
  ON notices FOR ALL USING (
    public.is_group_member(space_id)
  );

GRANT ALL ON notices TO authenticated;
