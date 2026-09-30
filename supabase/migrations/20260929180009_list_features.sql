-- Migration Etapa 8: Funcionalidades de Listas (Lists)

CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segurança RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lists access"
  ON lists FOR ALL USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = lists.space_id))
  );

CREATE POLICY "List Items access"
  ON list_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN spaces s ON s.id = l.space_id
      WHERE l.id = list_items.list_id
      AND public.is_group_member(s.group_id)
    )
  );

GRANT ALL ON lists TO authenticated;
GRANT ALL ON list_items TO authenticated;
