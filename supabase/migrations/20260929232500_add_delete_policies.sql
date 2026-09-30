-- Adicionando políticas de exclusão (DELETE) que estavam faltando

-- Tasks
CREATE POLICY "Users can delete tasks in their spaces" 
  ON tasks FOR DELETE USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = tasks.space_id))
  );

-- Notices
CREATE POLICY "Users can delete notices in their spaces" 
  ON notices FOR DELETE USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = notices.space_id))
  );

-- Events
CREATE POLICY "Users can delete events in their spaces" 
  ON events FOR DELETE USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = events.space_id))
  );

-- Lists
CREATE POLICY "Users can delete lists in their spaces" 
  ON lists FOR DELETE USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = lists.space_id))
  );

-- Ideas
CREATE POLICY "Users can delete ideas in their spaces" 
  ON ideas FOR DELETE USING (
    public.is_group_member((SELECT group_id FROM spaces WHERE id = ideas.space_id))
  );
