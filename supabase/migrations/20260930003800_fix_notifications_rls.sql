-- Corrige as permissões de notificação para permitir que membros do grupo enviem notificações uns aos outros
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING ( profile_id = auth.uid() );

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING ( profile_id = auth.uid() )
WITH CHECK ( profile_id = auth.uid() );

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING ( profile_id = auth.uid() );

CREATE POLICY "Users can insert notifications for group members"
ON public.notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.profile_id = notifications.profile_id
    AND public.is_group_member(gm.group_id)
  )
);
