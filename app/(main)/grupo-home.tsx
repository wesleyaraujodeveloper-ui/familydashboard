import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function GroupHomeScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const { activeGroup } = useGroup();
  const { spaces, activeSpace, setActiveSpace } = useSpace();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'spaces' | null>(null);
  
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const gradientColors = (theme.isDarkMode 
    ? ['#2E1534', '#151733', '#0C0F1A']
    : ['#FCE7F3', '#E0E7FF', '#E0F2FE']) as readonly [string, string, string];

  return (
    <LinearGradient colors={gradientColors} style={styles.mainContainer}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(main)/mural')}>
            <View style={[styles.quickActionIcon, { backgroundColor: theme.isDarkMode ? '#0A192F' : '#DBEAFE' }]}>
              <Feather name="layout" size={24} color={theme.isDarkMode ? '#38BDF8' : '#3B82F6'} />
            </View>
            <Text style={styles.quickActionLabel}>Mural</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(main)/meu-dia')}>
            <View style={[styles.quickActionIcon, { backgroundColor: theme.isDarkMode ? '#3A0C1E' : '#FCE7F3' }]}>
              <Feather name="sun" size={24} color={theme.isDarkMode ? '#F472B6' : '#EC4899'} />
            </View>
            <Text style={styles.quickActionLabel}>Meu Dia</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/')}>
            <View style={[styles.quickActionIcon, { backgroundColor: theme.isDarkMode ? '#451A03' : '#FEF3C7' }]}>
              <Feather name="grid" size={24} color={theme.isDarkMode ? '#FBBF24' : '#D97706'} />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={styles.quickActionLabel}>Hub</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => setExpandedSection(expandedSection === 'spaces' ? null : 'spaces')}>
            <View style={[styles.quickActionIcon, { backgroundColor: theme.isDarkMode ? '#064E3B' : '#DCFCE7' }]}>
              <Feather name="hash" size={24} color={theme.isDarkMode ? '#34D399' : '#16A34A'} />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={styles.quickActionLabel}>Espaços</Text>
              <Feather name={expandedSection === 'spaces' ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity onPress={() => router.push('/(main)/meu-dia')} style={[styles.metricCard, { backgroundColor: theme.isDarkMode ? '#1C1C1E' : 'rgba(255, 255, 255, 0.7)', borderColor: theme.isDarkMode ? '#2C2C2E' : 'rgba(255, 255, 255, 0.9)' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.isDarkMode ? '#3A1515' : '#FEE2E2' }]}>
                <Feather name="check-circle" size={20} color={theme.isDarkMode ? '#F87171' : '#EF4444'} />
              </View>
              <View style={[styles.pill, { backgroundColor: theme.isDarkMode ? '#3A1515' : '#FEE2E2' }]}>
                <Text style={[styles.pillText, { color: theme.isDarkMode ? '#F87171' : '#B91C1C' }]}>{tasksToday.progress.toFixed(0)}% Feito</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={[styles.valNum, { color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B' }]}>{tasksToday.done}/{tasksToday.total}</Text>
              </View>
              <Text style={[styles.valLabel, { color: theme.isDarkMode ? '#A78BFA' : '#6366F1' }]}>tarefas hoje</Text>
              <View style={[styles.progressTrack, { backgroundColor: theme.isDarkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
                <LinearGradient
                  colors={theme.isDarkMode ? ['#991B1B', '#EF4444'] : ['#FCA5A5', '#EF4444']}
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                  style={[styles.progressFill, { width: `${tasksToday.progress}%` }]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Metric 2: Compromissos */}
          <TouchableOpacity onPress={() => router.push('/(main)/calendario')} style={[styles.metricCard, { backgroundColor: theme.isDarkMode ? '#1C1C1E' : 'rgba(255, 255, 255, 0.7)', borderColor: theme.isDarkMode ? '#2C2C2E' : 'rgba(255, 255, 255, 0.9)' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.isDarkMode ? '#1E1E3F' : '#E0E7FF' }]}>
                <Feather name="clock" size={20} color={theme.isDarkMode ? '#818CF8' : '#6366F1'} />
              </View>
              <View style={[styles.pill, { backgroundColor: theme.isDarkMode ? '#1E1E3F' : '#E0E7FF' }]}>
                <Text style={[styles.pillText, { color: theme.isDarkMode ? '#818CF8' : '#4338CA' }]}>Eventos</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={[styles.valNum, { color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B' }]}>{upcomingEvents.length}</Text>
              </View>
              <Text style={[styles.valLabel, { color: theme.isDarkMode ? '#A78BFA' : '#6366F1' }]}>hoje & breve</Text>
              {upcomingEvents.length > 0 ? (
                <Text style={[styles.infoText, { color: theme.isDarkMode ? '#D1D5DB' : '#475569' }]} numberOfLines={1}>
                  {upcomingEvents[0].title}
                </Text>
              ) : (
                <Text style={styles.infoText}>Agenda livre!</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Metric 3: Recados */}
          <TouchableOpacity onPress={() => router.push('/(main)/mural')} style={[styles.metricCard, { backgroundColor: theme.isDarkMode ? '#1C1C1E' : 'rgba(255, 255, 255, 0.7)', borderColor: theme.isDarkMode ? '#2C2C2E' : 'rgba(255, 255, 255, 0.9)' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.isDarkMode ? '#3A152E' : '#FDF4FF' }]}>
                <Feather name="heart" size={20} color={theme.isDarkMode ? '#D946EF' : '#D946EF'} />
              </View>
              <View style={[styles.pill, { backgroundColor: theme.isDarkMode ? '#3A152E' : '#FDF4FF' }]}>
                <Text style={[styles.pillText, { color: theme.isDarkMode ? '#F472B6' : '#A21CAF' }]}>Mural</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={[styles.valNum, { color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B' }]}>{recentNotices.length}</Text>
              </View>
              <Text style={[styles.valLabel, { color: theme.isDarkMode ? '#A78BFA' : '#6366F1' }]}>novos recados</Text>
              {recentNotices.length > 0 ? (
                <Text style={[styles.infoText, { color: theme.isDarkMode ? '#D1D5DB' : '#475569' }]} numberOfLines={1}>
                  "{recentNotices[0].text}"
                </Text>
              ) : (
                <Text style={styles.infoText}>Nenhuma novidade.</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Metric 4: Atrasadas */}
          <TouchableOpacity onPress={() => router.push('/(main)/meu-dia')} style={[styles.metricCard, { backgroundColor: theme.isDarkMode ? '#1C1C1E' : 'rgba(255, 255, 255, 0.7)', borderColor: theme.isDarkMode ? '#2C2C2E' : 'rgba(255, 255, 255, 0.9)' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.isDarkMode ? '#3A2015' : '#FFEDD5' }]}>
                <Feather name="alert-circle" size={20} color={theme.isDarkMode ? '#F97316' : '#F97316'} />
              </View>
              <View style={[styles.pill, { backgroundColor: theme.isDarkMode ? '#3A2015' : '#FFEDD5' }]}>
                <Text style={[styles.pillText, { color: theme.isDarkMode ? '#FB923C' : '#C2410C' }]}>Atenção</Text>
              </View>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.valRow}>
                <Text style={[styles.valNum, { color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B' }]}>{overdueTasks.length}</Text>
              </View>
              <Text style={[styles.valLabel, { color: theme.isDarkMode ? '#A78BFA' : '#6366F1' }]}>tarefas atrasadas</Text>
              {overdueTasks.length > 0 ? (
                <Text style={[styles.infoText, { color: theme.isDarkMode ? '#FB923C' : '#C2410C' }]} numberOfLines={1}>
                  {overdueTasks[0].title}
                </Text>
              ) : (
                <Text style={styles.infoText}>Tudo em dia!</Text>
              )}
            </View>
          </TouchableOpacity>

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B',
    marginBottom: 16,
    marginLeft: 4,
    marginTop: 20,
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
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  metricCard: {
    width: '48%',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  metricBody: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  valNum: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1
  },
  valLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 8
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedPanel: {
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.isDarkMode ? '#1C1C1E' : '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  expandedItemActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.isDarkMode ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.05)'
  },
  expandedItemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    fontWeight: '500'
  }
});
