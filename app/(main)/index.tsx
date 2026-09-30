import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OverviewScreen() {
  const { user } = useAuth();
  const { activeGroup } = useGroup();
  const { spaces } = useSpace();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
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

  const getGreetingSub = () => {
    return 'Acompanhe tarefas coletivas e recados carinhosos num só lugar.';
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER DE BOAS VINDAS */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>Lar em sintonia</Text>
          </View>
          <Text style={styles.greeting}>{getGreeting()}, {firstName}!</Text>
          <Text style={styles.subGreeting}>{getGreetingSub()}</Text>
        </View>
        <Avatar name={profile?.name} url={profile?.avatar_url} size="lg" />
      </View>

      {/* METRICAS GRID */}
      <View style={styles.grid}>
        
        {/* Metric 1: Tarefas de Hoje */}
        <Card style={styles.metricCard} elevation="level1">
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
              <Feather name="check-circle" size={20} color="#ef4444" />
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{tasksToday.done} concluídas</Text>
            </View>
          </View>
          <View style={styles.metricBody}>
            <View style={styles.valRow}>
              <Text style={styles.valNum}>{tasksToday.total}</Text>
              <Text style={styles.valLabel}>tarefas hoje</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${tasksToday.progress}%` }]} />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Meta do dia</Text>
              <Text style={styles.progressVal}>{tasksToday.progress.toFixed(0)}% feito</Text>
            </View>
          </View>
        </Card>

        {/* Metric 2: Compromissos */}
        <Card style={styles.metricCard} elevation="level1">
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
              <Feather name="calendar" size={20} color={theme.colors.primary} />
            </View>
            <View style={[styles.pill, { backgroundColor: '#f1f5f9' }]}>
              <Text style={[styles.pillText, { color: '#64748b' }]}>Hoje/Breve</Text>
            </View>
          </View>
          <View style={styles.metricBody}>
            <View style={styles.valRow}>
              <Text style={styles.valNum}>{upcomingEvents.length}</Text>
              <Text style={styles.valLabel}>compromissos</Text>
            </View>
            {upcomingEvents.length > 0 ? (
              <Text style={styles.infoText} numberOfLines={1}>
                Próximo: <Text style={{fontWeight:'bold'}}>{upcomingEvents[0].title}</Text>
              </Text>
            ) : (
              <Text style={styles.infoText}>Nenhum evento agendado</Text>
            )}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Cheque seu calendário</Text>
            </View>
          </View>
        </Card>

        {/* Metric 3: Tarefa Atrasada */}
        <Card style={styles.metricCard} elevation="level1">
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#ffedd5' }]}>
              <Feather name="alert-triangle" size={20} color="#f97316" />
            </View>
            <View style={[styles.pill, { backgroundColor: '#ffedd5' }]}>
              <Text style={[styles.pillText, { color: '#c2410c' }]}>Atenção</Text>
            </View>
          </View>
          <View style={styles.metricBody}>
            <View style={styles.valRow}>
              <Text style={[styles.valNum, { color: '#f97316' }]}>{overdueTasks.length}</Text>
              <Text style={styles.valLabel}>tarefa atrasada</Text>
            </View>
            {overdueTasks.length > 0 ? (
              <Text style={[styles.infoText, { color: '#c2410c', fontWeight: 'bold' }]} numberOfLines={1}>
                {overdueTasks[0].title}
              </Text>
            ) : (
              <Text style={styles.infoText}>Tudo em dia!</Text>
            )}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Requer ação</Text>
              {overdueTasks.length > 0 && <Text style={[styles.progressVal, { color: theme.colors.primary }]}>Ver</Text>}
            </View>
          </View>
        </Card>

        {/* Metric 4: Recados */}
        <Card style={styles.metricCard} elevation="level1">
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#fdf4ff' }]}>
              <Feather name="message-square" size={20} color="#d946ef" />
            </View>
            <View style={[styles.pill, { backgroundColor: '#fdf4ff' }]}>
              <Text style={[styles.pillText, { color: '#a21caf' }]}>Recentes</Text>
            </View>
          </View>
          <View style={styles.metricBody}>
            <View style={styles.valRow}>
              <Text style={styles.valNum}>{recentNotices.length}</Text>
              <Text style={styles.valLabel}>recados novos</Text>
            </View>
            {recentNotices.length > 0 ? (
              <Text style={styles.infoText} numberOfLines={1}>
                "{recentNotices[0].text}"
              </Text>
            ) : (
              <Text style={styles.infoText}>Mural de recados limpo</Text>
            )}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {recentNotices.length > 0 ? `Por ${recentNotices[0].profiles?.name.split(' ')[0]}` : ''}
              </Text>
              <Text style={[styles.progressVal, { color: theme.colors.primary }]}>Ver mural</Text>
            </View>
          </View>
        </Card>

      </View>
      
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md
  },
  headerTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 6
  },
  badgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: 'bold'
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1,
    marginBottom: 8
  },
  subGreeting: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8
  },
  metricCard: {
    width: '45%',
    minWidth: 280,
    flexGrow: 1,
    margin: 8,
    padding: theme.spacing.lg,
    justifyContent: 'space-between'
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pill: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  pillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1d4ed8'
  },
  metricBody: {
    flex: 1
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8
  },
  valNum: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginRight: 8
  },
  valLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 8
  },
  progressLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  progressVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6'
  }
});
