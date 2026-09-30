import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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

  // Derivar marcadores no calendário com customStyles para o visual ZenZ (fundo redondo colorido)
  const markedDates: any = {};
  items.forEach(item => {
    let bgColor = '#10B981'; // Default (green)
    if (item.type === 'event') bgColor = '#EF4444'; // Red
    if (item.type === 'notice') bgColor = '#F59E0B'; // Orange
    if (item.type === 'idea') bgColor = '#EAB308'; // Yellow
    if (item.type === 'list') bgColor = '#3B82F6'; // Blue
    
    // Se a data já existe e é a selecionada, mantemos a borda/destaque especial
    markedDates[item.date_iso] = { 
      customStyles: {
        container: {
          backgroundColor: item.date_iso === selectedDate ? theme.colors.primary : bgColor,
          borderRadius: 20,
          elevation: item.date_iso === selectedDate ? 4 : 2,
          shadowColor: item.date_iso === selectedDate ? theme.colors.primary : bgColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          transform: [{ scale: item.date_iso === selectedDate ? 1.1 : 1 }]
        },
        text: {
          color: '#ffffff',
          fontWeight: 'bold'
        }
      }
    };
  });
  
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = { 
      customStyles: {
        container: { backgroundColor: theme.colors.primary, borderRadius: 20 },
        text: { color: '#ffffff', fontWeight: 'bold' }
      }
    };
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
        <Card style={[styles.baseCard, { padding: theme.spacing.md }]} key={'event' + item.id}>
          <View style={[styles.eventCard, { padding: 0, marginBottom: 0 }]}>
            <View style={styles.eventLeft}>
              <Text style={styles.eventTimeText}>{item.time_formatted}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemTitle}>📅 {item.title}</Text>
              <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
            </View>
          </View>
        </Card>
      );
    }

    if (item.type === 'task') {
      return (
        <TouchableOpacity key={'task' + item.id} onPress={() => router.push(`/(main)/tarefa/${item.id}` as any)} activeOpacity={0.8}>
          <Card style={[styles.baseCard, item.status === 'done' && { opacity: 0.5 }]}>
            <View style={styles.taskHeader}>
              <Text style={[styles.itemTitle, item.status === 'done' && { textDecorationLine: 'line-through' }]}>✅ {item.title}</Text>
              {item.priority && (
                <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                  <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority}</Text>
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
        <Card style={styles.baseCard} key={'notice' + item.id}>
          <Text style={styles.itemTitle}>📌 {item.title}</Text>
          <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
        </Card>
      );
    }

    if (item.type === 'list') {
      return (
        <TouchableOpacity key={'list' + item.id} onPress={() => router.push(`/(main)/lista/${item.id}` as any)} activeOpacity={0.8}>
          <Card style={styles.baseCard}>
            <Text style={styles.itemTitle}>📋 {item.title}</Text>
            <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
          </Card>
        </TouchableOpacity>
      );
    }

    if (item.type === 'idea') {
      return (
        <Card style={styles.baseCard} key={'idea' + item.id}>
          <Text style={styles.itemTitle}>💡 {item.title}</Text>
          <Text style={styles.spaceBadge}>📍 {item.space_name}</Text>
        </Card>
      );
    }
  };

  return (
    <LinearGradient colors={['#FCA5A5', theme.colors.primary]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Calendário</Text>
        <Text style={styles.subtitle}>Visão geral dos seus compromissos e prazos</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            markingType="custom"
            current={selectedDate}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#9CA3AF',
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.textPrimary,
              textDisabledColor: '#D1D5DB',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.textPrimary,
              textDayFontWeight: '600',
              textMonthFontWeight: '900',
              textDayHeaderFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 20,
            }}
          />
        </View>

        <View style={styles.agendaContainer}>
          <Text style={styles.agendaTitle}>Agenda ({selectedDate.split('-').reverse().join('/')})</Text>
          
          {loading ? (
             <ActivityIndicator size="small" color="#ffffff" style={{marginTop: 20}} />
          ) : selectedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum item agendado.</Text>
            </View>
          ) : (
            selectedItems.map(renderItem)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(main)/criar-compromisso' as any)}>
        <Feather name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: theme.spacing.lg, paddingBottom: 0, paddingTop: theme.spacing.xl },
  title: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: theme.spacing.xs, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: 'rgba(255,255,255,0.9)', marginBottom: theme.spacing.lg },
  
  calendarContainer: { marginHorizontal: theme.spacing.lg, borderRadius: 24, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, backgroundColor: '#ffffff', marginBottom: theme.spacing.xl, paddingVertical: 10 },
  
  agendaContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: 100 },
  agendaTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: '900', color: '#ffffff', marginBottom: theme.spacing.md, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  
  emptyState: { alignItems: 'center', marginTop: 10, padding: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 },
  emptyStateText: { fontSize: theme.typography.sizes.bodyLg, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' },

  // Base Card Style (ZenZ)
  baseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, flex: 1, marginBottom: 4 },
  
  eventCard: { flexDirection: 'row', alignItems: 'center' },
  eventLeft: { backgroundColor: '#FFF1F2', padding: theme.spacing.md, borderRadius: 16, marginRight: theme.spacing.md, alignItems: 'center', minWidth: 65 },
  eventTimeText: { fontSize: theme.typography.sizes.bodyLg, fontWeight: '900', color: '#881337' },
  
  itemRight: { flex: 1 },
  spaceBadge: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.textSecondary, fontWeight: '600' },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  priority_high: { backgroundColor: '#FEE2E2' },
  priority_high_text: { color: '#B91C1C' },
  priority_medium: { backgroundColor: '#FEF3C7' },
  priority_medium_text: { color: '#B45309' },
  priority_low: { backgroundColor: '#E0E7FF' },
  priority_low_text: { color: '#4338CA' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EC4899', // Pinkish red, like the image
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8
  }
});
