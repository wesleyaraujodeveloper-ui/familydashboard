import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Card } from '../../src/components/ui/Card';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';

type MyDayItem = {
  id: string;
  type: 'task' | 'event';
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  start_time?: string;
  due_date?: string;
  space_id: string;
  space_name?: string;
};

export default function MeuDiaScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { spaces } = useSpace();
  const [items, setItems] = useState<MyDayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDay = useCallback(async () => {
    if (!spaces || spaces.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const spaceIds = spaces.map(s => s.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayIso = today.toISOString();
    const endOfTodayIso = endOfToday.toISOString();

    // Buscar tudo que não foi concluído e filtrar no JS para simplificar e garantir precisão da Timezone
    const [tasksRes, eventsRes, noticesRes, listsRes, ideasRes] = await Promise.all([
      supabase.from('tasks').select('*').in('space_id', spaceIds).neq('status', 'done'),
      supabase.from('events').select('*').in('space_id', spaceIds)
        .gte('start_time', todayIso)
        .lte('start_time', endOfTodayIso),
      supabase.from('notices').select('*').in('space_id', spaceIds),
      supabase.from('lists').select('*').in('space_id', spaceIds),
      supabase.from('ideas').select('*').in('space_id', spaceIds)
    ]);

    const combined: MyDayItem[] = [];

    if (!tasksRes.error && tasksRes.data) {
      tasksRes.data.forEach(t => {
        // Filtrar tarefas atrasadas ou que vencem hoje
        let shouldInclude = false;
        if (t.due_date) {
          const dueDate = new Date(t.due_date);
          if (dueDate <= endOfToday) shouldInclude = true;
        } else if (t.status === 'in_progress') {
          // Se não tem data, mas está em andamento, mostramos no Meu Dia
          shouldInclude = true;
        }

        if (shouldInclude) {
          const spaceName = spaces.find(s => s.id === t.space_id)?.name || 'Desconhecido';
          combined.push({ ...t, type: 'task', space_name: spaceName } as MyDayItem);
        }
      });
    }

    if (!eventsRes.error && eventsRes.data) {
      eventsRes.data.forEach(e => {
        const spaceName = spaces.find(s => s.id === e.space_id)?.name || 'Desconhecido';
        combined.push({ ...e, type: 'event', space_name: spaceName } as MyDayItem);
      });
    }

    // Helpers genéricos para Notices, Lists, Ideas (tudo tem due_date agora)
    const processGenericEntity = (res: any, type: string) => {
      if (!res.error && res.data) {
        res.data.forEach((item: any) => {
          if (item.due_date) {
            const dueDate = new Date(item.due_date);
            if (dueDate <= endOfToday) {
              const spaceName = spaces.find(s => s.id === item.space_id)?.name || 'Desconhecido';
              combined.push({ ...item, type, space_name: spaceName, title: item.title || item.text } as MyDayItem);
            }
          }
        });
      }
    };

    processGenericEntity(noticesRes, 'notice');
    processGenericEntity(listsRes, 'list');
    processGenericEntity(ideasRes, 'idea');

    // Ordenar (eventos primeiro, depois outras atividades)
    combined.sort((a, b) => {
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (a.type !== 'event' && b.type === 'event') return 1;
      return 0; // fallback simples
    });

    setItems(combined);
    setLoading(false);
  }, [spaces]);

  useFocusEffect(
    useCallback(() => {
      fetchMyDay();
    }, [fetchMyDay])
  );

  const renderItem = (item: MyDayItem) => {
    if (item.type === 'event') {
      const dateObj = new Date(item.start_time!);
      const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return (
        <Card elevation="level1" style={styles.eventCard} key={'event' + item.id}>
          <View style={styles.eventLeft}>
            <Text style={styles.eventTimeText}>{formattedTime}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemTitle}>📅 {item.title}</Text>
            <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
          </View>
        </Card>
      );
    }

    if (item.type === 'task') {
      return (
        <TouchableOpacity key={'task' + item.id} onPress={() => router.push(`/(main)/tarefa/${item.id}` as any)} activeOpacity={0.8}>
          <Card elevation="level1" style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.itemTitle}>✅ {item.title}</Text>
              {item.priority && (
                <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                  <Text style={styles.badgeText}>{item.priority}</Text>
                </View>
              )}
            </View>
            <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
          </Card>
        </TouchableOpacity>
      );
    }

    if (item.type === 'notice') {
      return (
        <Card elevation="level1" style={styles.noticeCard} key={'notice' + item.id}>
          <Text style={styles.itemTitle}>📌 {item.title}</Text>
          <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
        </Card>
      );
    }

    if (item.type === 'list') {
      return (
        <TouchableOpacity key={'list' + item.id} onPress={() => router.push(`/(main)/lista/${item.id}` as any)} activeOpacity={0.8}>
          <Card elevation="level1" style={styles.listCard}>
            <Text style={styles.itemTitle}>📋 {item.title}</Text>
            <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
          </Card>
        </TouchableOpacity>
      );
    }

    if (item.type === 'idea') {
      return (
        <Card elevation="level1" style={styles.ideaCard} key={'idea' + item.id}>
          <Text style={styles.itemTitle}>💡 {item.title}</Text>
          <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
        </Card>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌞 Meu Dia</Text>
        <Text style={styles.subtitle}>Sua visão geral de todas as tarefas e eventos de hoje</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Tudo limpo para hoje! Aproveite o dia. 🎉</Text>
            </View>
          ) : (
            items.map(renderItem)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: theme.spacing.lg, paddingBottom: 0 },
  title: { fontSize: theme.typography.sizes.headlineXl, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  
  feed: { flex: 1 },
  feedContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyStateText: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, textAlign: 'center' },

  // Cards
  taskCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e8f5e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, flex: 1, marginBottom: 4 },
  
  eventCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDarkMode ? '#1E1F24' : '#ffebee', borderLeftWidth: 4, borderLeftColor: '#f44336' },
  eventLeft: { paddingRight: theme.spacing.md, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.1)', marginRight: theme.spacing.md, alignItems: 'center', minWidth: 60 },
  eventTimeText: { fontSize: theme.typography.sizes.bodyLg, fontWeight: 'bold', color: theme.colors.textPrimary },
  
  noticeCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fff3e0', borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  listCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e0f7fa', borderLeftWidth: 4, borderLeftColor: '#00bcd4' },
  ideaCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fffde7', borderLeftWidth: 4, borderLeftColor: '#ffeb3b' },
  
  itemRight: { flex: 1 },
  spaceBadge: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.textSecondary, fontWeight: '500' },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  priority_high: { backgroundColor: theme.colors.error },
  priority_medium: { backgroundColor: theme.colors.warning },
  priority_low: { backgroundColor: theme.colors.secondary },
});
