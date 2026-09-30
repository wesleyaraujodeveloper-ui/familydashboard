-- Fix RLS Policies because `is_group_member` takes `group_id`, not `space_id`.

-- 1. Fix Notices RLS
DROP POLICY IF EXISTS "Notices access" ON notices;
CREATE POLICY "Notices access"
  ON notices FOR ALL USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = notices.space_id))
  );

-- 2. Fix Task Checklists RLS
DROP POLICY IF EXISTS "Checklists access" ON task_checklists;
CREATE POLICY "Checklists access"
  ON task_checklists FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN spaces s ON s.id = t.space_id
      WHERE t.id = task_checklists.task_id
      AND public.is_group_member(s.group_id)
    )
  );

-- 3. Fix Task Comments RLS
DROP POLICY IF EXISTS "Comments access for tasks" ON comments;
CREATE POLICY "Comments access for tasks"
  ON comments FOR ALL USING (
    (entity_type = 'task') AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN spaces s ON s.id = t.space_id
      WHERE t.id = comments.entity_id
      AND public.is_group_member(s.group_id)
    )
  );
