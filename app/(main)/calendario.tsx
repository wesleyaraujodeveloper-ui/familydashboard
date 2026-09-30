import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';

// PT-BR Calendar config
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

type CalendarItem = {
  id: string;
  type: 'task' | 'event' | 'notice' | 'list' | 'idea';
  title: string;
  date_iso: string; // the formatted YYYY-MM-DD string for grouping
  time_formatted?: string;
  space_id: string;
  space_name?: string;
  priority?: string;
  status?: string;
};

export default function CalendarioScreen() {
  const router = useRouter();
  const { spaces } = useSpace();
  
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchCalendar = useCallback(async () => {
    if (!spaces || spaces.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const spaceIds = spaces.map(s => s.id);

    // Fetch tudo que tem data
    const [tasksRes, eventsRes, noticesRes, listsRes, ideasRes] = await Promise.all([
      supabase.from('tasks').select('*').in('space_id', spaceIds).not('due_date', 'is', null),
      supabase.from('events').select('*').in('space_id', spaceIds),
      supabase.from('notices').select('*').in('space_id', spaceIds).not('due_date', 'is', null),
      supabase.from('lists').select('*').in('space_id', spaceIds).not('due_date', 'is', null),
      supabase.from('ideas').select('*').in('space_id', spaceIds).not('due_date', 'is', null)
    ]);

    const combined: CalendarItem[] = [];

    const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || 'Desconhecido';

    const processEntity = (res: any, type: string, dateField: string = 'due_date') => {
      if (!res.error && res.data) {
        res.data.forEach((item: any) => {
          if (item[dateField]) {
            const dateObj = new Date(item[dateField]);
            const iso = dateObj.toISOString().split('T')[0];
            const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            combined.push({
              id: item.id,
              type: type as any,
              title: item.title || item.text,
              date_iso: iso,
              time_formatted: type === 'event' ? time : undefined,
              space_id: item.space_id,
              space_name: getSpaceName(item.space_id),
              priority: item.priority,
              status: item.status
            });
          }
        });
      }
    };

    processEntity(tasksRes, 'task');
    processEntity(eventsRes, 'event', 'start_time');
    processEntity(noticesRes, 'notice');
    processEntity(listsRes, 'list');
    processEntity(ideasRes, 'idea');

    setItems(combined);
    setLoading(false);
  }, [spaces]);

  useFocusEffect(
    useCallback(() => {
      fetchCalendar();
    }, [fetchCalendar])
  );

  // Derivar marcadores no calendário
  const markedDates: any = {};
  items.forEach(item => {
    let dotColor = theme.colors.primary;
    if (item.type === 'event') dotColor = theme.colors.secondary;
    if (item.type === 'notice') dotColor = theme.colors.tertiary;
    if (item.type === 'idea') dotColor = theme.colors.warning;
    
    markedDates[item.date_iso] = { 
      marked: true, 
      dotColor,
      ...(item.date_iso === selectedDate ? { selected: true, selectedColor: theme.colors.primary } : {})
    };
  });
  
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = { selected: true, selectedColor: theme.colors.primary };
  }

  const selectedItems = items.filter(i => i.date_iso === selectedDate);
  selectedItems.sort((a, b) => {
    if (a.type === 'event' && b.type !== 'event') return -1;
    if (a.type !== 'event' && b.type === 'event') return 1;
    return 0;
  });

  const renderItem = (item: CalendarItem) => {
    if (item.type === 'event') {
      return (
        <Card elevation="level1" style={styles.eventCard} key={'event' + item.id}>
          <View style={styles.eventLeft}>
            <Text style={styles.eventTimeText}>{item.time_formatted}</Text>
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
          <Card elevation="level1" style={[styles.taskCard, item.status === 'done' && { opacity: 0.5 }]}>
            <View style={styles.taskHeader}>
              <Text style={[styles.itemTitle, item.status === 'done' && { textDecorationLine: 'line-through' }]}>✅ {item.title}</Text>
              {item.priority && (
                <View style={[styles.badge, styles[`priority_${item.priority}` as keyof typeof styles]]}>
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
        <Text style={styles.title}>📅 Calendário</Text>
        <Text style={styles.subtitle}>Visão geral dos seus compromissos e prazos</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.textPrimary,
              textDisabledColor: theme.colors.textMuted,
              dotColor: theme.colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.textPrimary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
          />
        </View>

        <View style={styles.agendaContainer}>
          <Text style={styles.agendaTitle}>Agenda do Dia ({selectedDate.split('-').reverse().join('/')})</Text>
          
          {loading ? (
             <ActivityIndicator size="small" color={theme.colors.primary} style={{marginTop: 20}} />
          ) : selectedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum item agendado para este dia.</Text>
            </View>
          ) : (
            selectedItems.map(renderItem)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.lg, paddingBottom: 0 },
  title: { fontSize: theme.typography.sizes.displaySm, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  
  calendarContainer: { marginHorizontal: theme.spacing.lg, borderRadius: theme.radius.lg, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, backgroundColor: theme.colors.surface, marginBottom: theme.spacing.xl },
  
  agendaContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  agendaTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  
  emptyState: { alignItems: 'center', marginTop: 20, padding: 20 },
  emptyStateText: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, textAlign: 'center' },

  // Cards (Reaproveitados)
  taskCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#e8f5e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, flex: 1, marginBottom: 4 },
  
  eventCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', borderLeftWidth: 4, borderLeftColor: '#f44336' },
  eventLeft: { paddingRight: theme.spacing.md, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.1)', marginRight: theme.spacing.md, alignItems: 'center', minWidth: 60 },
  eventTimeText: { fontSize: theme.typography.sizes.bodyLg, fontWeight: 'bold', color: theme.colors.textPrimary },
  
  noticeCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#fff3e0', borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  listCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#e0f7fa', borderLeftWidth: 4, borderLeftColor: '#00bcd4' },
  ideaCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#fffde7', borderLeftWidth: 4, borderLeftColor: '#ffeb3b' },
  
  itemRight: { flex: 1 },
  spaceBadge: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.textSecondary, fontWeight: '500' },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  priority_high: { backgroundColor: theme.colors.error },
  priority_medium: { backgroundColor: theme.colors.warning },
  priority_low: { backgroundColor: theme.colors.secondary },
});
