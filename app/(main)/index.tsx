import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Avatar } from '../../src/components/ui/Avatar';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OverviewScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const { activeGroup, groups, setActiveGroup } = useGroup();
  const { spaces, activeSpace, setActiveSpace, setSpaces } = useSpace();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<'groups' | 'spaces' | null>(null);
  
  // Metricas
  const [tasksToday, setTasksToday] = useState({ total: 0, done: 0, progress: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !activeGroup) return;
      setLoading(true);

      const spaceIds = spaces.map(s => s.id);

      // Perfil atual
      const { data: pData } = await supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single();
      setProfile(pData);

      if (spaceIds.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Tarefas de hoje
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('id, status')
          .in('space_id', spaceIds)
          .gte('due_date', todayStr + 'T00:00:00Z')
          .lt('due_date', todayStr + 'T23:59:59Z');
        
        if (tasksData) {
          const total = tasksData.length;
          const done = tasksData.filter(t => t.status === 'done').length;
          setTasksToday({ total, done, progress: total > 0 ? (done / total) * 100 : 0 });
        }

        // Tarefas atrasadas
        const { data: overdueData } = await supabase
          .from('tasks')
          .select('id, title, due_date')
          .in('space_id', spaceIds)
          .eq('status', 'todo')
          .lt('due_date', todayStr + 'T00:00:00Z')
          .limit(1);
        setOverdueTasks(overdueData || []);

        // Compromissos
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, start_time')
          .in('space_id', spaceIds)
          .gte('start_time', todayStr + 'T00:00:00Z')
          .order('start_time', { ascending: true })
          .limit(2);
        setUpcomingEvents(eventsData || []);

        // Recados
        const { data: noticesData } = await supabase
          .from('notices')
          .select('id, text, created_at, profiles(name)')
          .in('space_id', spaceIds)
          .order('created_at', { ascending: false })
          .limit(3);
        setRecentNotices(noticesData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, activeGroup, spaces]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Usuário';

  return (
    <LinearGradient colors={['#FCE7F3', '#E0E7FF', '#E0F2FE']} style={styles.mainContainer}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* HEADER DE BOAS VINDAS */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <View style={styles.badge}>
              <View style={styles.dot} />
              <Text style={styles.badgeText}>Lar & Equipe</Text>
            </View>
            <Text style={styles.greeting}>{getGreeting()}, {firstName}! ✨</Text>
            <Text style={styles.subGreeting}>Vamos organizar o dia da família juntos.</Text>
          </View>
          <View style={styles.avatarWrapper}>
            <Avatar name={profile?.name} url={profile?.avatar_url} size="lg" />
            <View style={styles.notificationDot} />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(main)/mural')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Feather name="layout" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionLabel}>Mural</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(main)/meu-dia')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
              <Feather name="sun" size={24} color="#EC4899" />
            </View>
            <Text style={styles.quickActionLabel}>Meu Dia</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => setExpandedSection(prev => prev === 'groups' ? null : 'groups')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="users" size={24} color="#D97706" />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={styles.quickActionLabel}>Grupos</Text>
              <Feather name={expandedSection === 'groups' ? 'chevron-up' : 'chevron-down'} size={14} color="#D97706" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => setExpandedSection(prev => prev === 'spaces' ? null : 'spaces')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Feather name="hash" size={24} color="#16A34A" />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={styles.quickActionLabel}>Espaços</Text>
              <Feather name={expandedSection === 'spaces' ? 'chevron-up' : 'chevron-down'} size={14} color="#16A34A" />
            </View>
          </TouchableOpacity>
        </View>

        {/* EXPANDED SECTIONS */}
        {expandedSection === 'groups' && (
          <View style={styles.expandedPanel}>
            <Text style={styles.expandedTitle}>Meus Grupos</Text>
            {groups.map(group => (
              <TouchableOpacity 
                key={group.id} 
                style={[styles.expandedItem, activeGroup?.id === group.id && styles.expandedItemActive]}
                onPress={async () => {
                  setActiveGroup(group);
                  setExpandedSection(null);
                  const { data: spacesData } = await supabase.from('spaces').select('*').eq('group_id', group.id).order('created_at', { ascending: true });
                  if (spacesData && spacesData.length > 0) {
                    setSpaces(spacesData);
                    setActiveSpace(spacesData[0]);
                  } else {
                    setSpaces([]);
                    setActiveSpace(null as any);
                  }
                  router.push('/(main)/mural');
                }}
              >
                <Feather name="users" size={16} color={activeGroup?.id === group.id ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.expandedItemText, activeGroup?.id === group.id && { color: theme.colors.primary, fontWeight: 'bold' }]}>{group.name}</Text>
                {activeGroup?.id === group.id && <Feather name="check" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}

          </View>
        )}

        {expandedSection === 'spaces' && (
          <View style={styles.expandedPanel}>
            <Text style={styles.expandedTitle}>Espaços de {activeGroup?.name}</Text>
            {spaces.map(space => (
              <TouchableOpacity 
                key={space.id} 
                style={[styles.expandedItem, activeSpace?.id === space.id && styles.expandedItemActive]}
                onPress={() => {
                  setActiveSpace(space);
                  setExpandedSection(null);
                  router.push('/(main)/mural' as any);
                }}
              >
                <Feather name="hash" size={16} color={activeSpace?.id === space.id ? theme.colors.secondary : theme.colors.textSecondary} />
                <Text style={[styles.expandedItemText, activeSpace?.id === space.id && { color: theme.colors.secondary, fontWeight: 'bold' }]}>{space.name}</Text>
                {activeSpace?.id === space.id && <Feather name="check" size={16} color={theme.colors.secondary} />}
              </TouchableOpacity>
            ))}

          </View>
        )}

        {/* METRICAS GRID */}
        <Text style={styles.sectionTitle}>O que temos para hoje?</Text>
        <View style={styles.grid}>
          
          {/* Metric 1: Tarefas de Hoje */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="check-circle" size={20} color="#EF4444" />
              </View>
              <View style={[styles.pill, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.pillText, { color: '#B91C1C' }]}>{tasksToday.progress.toFixed(0)}% Feito</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={styles.valNum}>{tasksToday.done}/{tasksToday.total}</Text>
              </View>
              <Text style={styles.valLabel}>tarefas hoje</Text>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#FCA5A5', '#EF4444']}
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                  style={[styles.progressFill, { width: `${tasksToday.progress}%` }]}
                />
              </View>
            </View>
          </View>

          {/* Metric 2: Compromissos */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <Feather name="clock" size={20} color="#6366F1" />
              </View>
              <View style={[styles.pill, { backgroundColor: '#E0E7FF' }]}>
                <Text style={[styles.pillText, { color: '#4338CA' }]}>Eventos</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={styles.valNum}>{upcomingEvents.length}</Text>
              </View>
              <Text style={styles.valLabel}>hoje & breve</Text>
              {upcomingEvents.length > 0 ? (
                <Text style={styles.infoText} numberOfLines={1}>
                  {upcomingEvents[0].title}
                </Text>
              ) : (
                <Text style={styles.infoText}>Agenda livre!</Text>
              )}
            </View>
          </View>

          {/* Metric 3: Recados */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FDF4FF' }]}>
                <Feather name="heart" size={20} color="#D946EF" />
              </View>
              <View style={[styles.pill, { backgroundColor: '#FDF4FF' }]}>
                <Text style={[styles.pillText, { color: '#A21CAF' }]}>Mural</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={styles.valNum}>{recentNotices.length}</Text>
              </View>
              <Text style={styles.valLabel}>novos recados</Text>
              {recentNotices.length > 0 ? (
                <Text style={styles.infoText} numberOfLines={1}>
                  "{recentNotices[0].text}"
                </Text>
              ) : (
                <Text style={styles.infoText}>Nenhuma novidade.</Text>
              )}
            </View>
          </View>

          {/* Metric 4: Atrasadas */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
                <Feather name="alert-circle" size={20} color="#F97316" />
              </View>
              <View style={[styles.pill, { backgroundColor: '#FFEDD5' }]}>
                <Text style={[styles.pillText, { color: '#C2410C' }]}>Atenção</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={styles.valNum}>{overdueTasks.length}</Text>
              </View>
              <Text style={styles.valLabel}>tarefas atrasadas</Text>
              {overdueTasks.length > 0 ? (
                <Text style={[styles.infoText, { color: '#C2410C' }]} numberOfLines={1}>
                  {overdueTasks[0].title}
                </Text>
              ) : (
                <Text style={styles.infoText}>Tudo em dia!</Text>
              )}
            </View>
          </View>

        </View>

      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => router.push('/(main)/criar-tarefa')}
      >
        <LinearGradient
          colors={['#C084FC', '#DB2777']}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollArea: { flex: 1, padding: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899',
    marginRight: 8
  },
  badgeText: {
    fontSize: 12,
    color: '#831843',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  greeting: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -1,
    marginBottom: 6
  },
  subGreeting: {
    fontSize: 16,
    color: '#4F46E5',
    opacity: 0.8,
    lineHeight: 22,
    fontWeight: '500'
  },
  avatarWrapper: {
    position: 'relative',
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 99
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: '#EF4444',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FCE7F3'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 16,
    marginLeft: 4
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4
  },
  quickActionBox: {
    alignItems: 'center',
    width: '22%'
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FFF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 20
  },
  expandedPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  expandedItemActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedItemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  expandedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  expandedActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  metricCard: {
    width: '45%',
    minWidth: 150,
    flexGrow: 1,
    margin: 8,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricBody: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4
  },
  valNum: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  valLabel: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500'
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  ctaContainer: {
    marginVertical: 16,
    marginHorizontal: 4,
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
    justifyContent: 'space-between'
  },
  ctaContent: {
    flex: 1
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
