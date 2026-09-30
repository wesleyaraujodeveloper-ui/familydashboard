import { supabase } from './supabase';

export const logActivity = async (
  groupId: string,
  profileId: string,
  entityType: string,
  entityTitle: string,
  action: 'created' | 'completed' | 'deleted' | 'commented' | 'updated'
) => {
  try {
    await supabase.from('activities').insert([{
      group_id: groupId,
      profile_id: profileId,
      entity_type: entityType,
      entity_title: entityTitle,
      action
    }]);

    // Busca outros membros do grupo
    const { data: members } = await supabase
      .from('group_members')
      .select('profile_id')
      .eq('group_id', groupId)
      .neq('profile_id', profileId);

    if (members && members.length > 0) {
      // Busca nome de quem fez a ação
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', profileId).single();
      const actorName = profile?.name || 'Alguém';

      const actionText = {
        'created': 'criou um novo item:',
        'completed': 'concluiu o item:',
        'deleted': 'excluiu o item:',
        'commented': 'comentou em:',
        'updated': 'atualizou o item:'
      }[action];

      const notifications = members.map(m => ({
        profile_id: m.profile_id,
        title: 'Nova Atividade',
        message: `${actorName} ${actionText} ${entityTitle}`,
        link: '/(main)/historico'
      }));

      await supabase.from('notifications').insert(notifications);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
