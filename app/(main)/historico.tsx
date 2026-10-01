import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { supabase } from '../../src/services/supabase';
import { useGroup } from '../../src/store/group';
import { Card } from '../../src/components/ui/Card';
import { Feather } from '@expo/vector-icons';

export default function HistoricoScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { activeGroup } = useGroup();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!activeGroup) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*, profiles(name, avatar_url)')
        .eq('group_id', activeGroup.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setActivities(data);
      }
      setLoading(false);
    };
    
    fetchActivities();

    if (!activeGroup) return;

    const channel = supabase
      .channel('custom-all-channel-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities', filter: `group_id=eq.${activeGroup.id}` },
        async (payload) => {
          // Fetch the profile for the new activity
          const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', payload.new.profile_id).single();
          const newActivity = { ...payload.new, profiles: profile };
          setActivities((prev) => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeGroup]);

  const getActionText = (action: string, entityType: string) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
    const typeNames: Record<string, string> = {
      'task': 'uma tarefa',
      'idea': 'uma ideia',
      'notice': 'um recado',
      'event': 'um compromisso',
      'list': 'uma lista'
    };
    const t = typeNames[entityType] || 'um item';

    switch (action) {
      case 'created': return `criou ${t}`;
      case 'completed': return `concluiu ${t}`;
      case 'deleted': return `apagou ${t}`;
      case 'commented': return `comentou em ${t}`;
      case 'updated': return `atualizou ${t}`;
      default: return `interagiu com ${t}`;
    }
  };

  const getActionIcon = (action: string) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
    switch (action) {
      case 'created': return <Feather name="plus-circle" size={16} color={theme.colors.primary} />;
      case 'completed': return <Feather name="check-circle" size={16} color={theme.colors.secondary} />;
      case 'deleted': return <Feather name="trash-2" size={16} color={theme.colors.error} />;
      case 'commented': return <Feather name="message-circle" size={16} color={theme.colors.accentSky} />;
      default: return <Feather name="activity" size={16} color={theme.colors.textMuted} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Histórico de Atividades</Text>
      <Text style={styles.subtitle}>Acompanhe tudo o que acontece no grupo {activeGroup?.name}</Text>

      <Card elevation="level1" style={styles.card}>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma atividade registrada ainda.</Text>
        ) : (
          activities.map(act => (
            <View key={act.id} style={styles.activityRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{act.profiles?.name?.charAt(0) || 'U'}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.text}>
                  <Text style={styles.author}>{act.profiles?.name || 'Alguém'} </Text>
                  {getActionText(act.action, act.entity_type)}: 
                  <Text style={styles.entityTitle}> "{act.entity_title}"</Text>
                </Text>
                <View style={styles.metaRow}>
                  {getActionIcon(act.action)}
                  <Text style={styles.time}>{new Date(act.created_at).toLocaleString('pt-BR')}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, width: '100%', marginHorizontal: 'auto' },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  card: { padding: theme.spacing.lg },
  emptyText: { color: theme.colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginVertical: theme.spacing.xl },
  activityRow: { flexDirection: 'row', marginBottom: theme.spacing.lg, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceSubdued, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: theme.colors.border },
  avatarInitial: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16 },
  content: { flex: 1 },
  text: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, lineHeight: 22 },
  author: { fontWeight: 'bold', color: theme.colors.textPrimary },
  entityTitle: { fontStyle: 'italic', color: theme.colors.textPrimary, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  time: { fontSize: 12, color: theme.colors.textMuted }
});
