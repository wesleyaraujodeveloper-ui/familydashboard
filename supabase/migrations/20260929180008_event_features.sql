-- Migration Etapa 8: Funcionalidades de Compromissos (Events)

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segurança RLS: Compromissos
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events access"
  ON events FOR ALL USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = events.space_id))
  );

GRANT ALL ON events TO authenticated;
