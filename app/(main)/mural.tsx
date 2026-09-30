import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, useWindowDimensions, Platform, Image, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';

type FeedItem = {
  id: string;
  type: 'task' | 'notice' | 'event' | 'list' | 'idea';
  title?: string;
  description?: string;
  text?: string;
  status: string; // Now guaranteed by universal status
  priority?: string;
  start_time?: string;
  image_url?: string;
  created_at: string;
};

type BoardColumns = {
  todo: FeedItem[];
  in_progress: FeedItem[];
  waiting: FeedItem[];
  done: FeedItem[];
};

const STATUS_ORDER = ['todo', 'in_progress', 'waiting', 'done'];

export default function MuralScreen() {
  const router = useRouter();
  const { activeSpace } = useSpace();
  const { width } = useWindowDimensions();
  
  const [board, setBoard] = useState<BoardColumns>({ todo: [], in_progress: [], waiting: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchFeed = async () => {
    if (!activeSpace) return;
    setLoading(true);
    
    // Busca Paralela de Tasks, Notices, Events, Lists e Ideas
    const [tasksRes, noticesRes, eventsRes, listsRes, ideasRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('space_id', activeSpace.id),
      supabase.from('notices').select('*').eq('space_id', activeSpace.id),
      supabase.from('events').select('*').eq('space_id', activeSpace.id),
      supabase.from('lists').select('*').eq('space_id', activeSpace.id),
      supabase.from('ideas').select('*').eq('space_id', activeSpace.id)
    ]);

    const combined: FeedItem[] = [];
    
    if (!tasksRes.error && tasksRes.data) combined.push(...tasksRes.data.map(t => ({ ...t, type: 'task' } as FeedItem)));
    if (!noticesRes.error && noticesRes.data) combined.push(...noticesRes.data.map(n => ({ ...n, type: 'notice' } as FeedItem)));
    if (!eventsRes.error && eventsRes.data) combined.push(...eventsRes.data.map(e => ({ ...e, type: 'event' } as FeedItem)));
    if (!listsRes.error && listsRes.data) combined.push(...listsRes.data.map(l => ({ ...l, type: 'list' } as FeedItem)));
    if (!ideasRes.error && ideasRes.data) combined.push(...ideasRes.data.map(i => ({ ...i, type: 'idea' } as FeedItem)));

    // Ordena do mais recente pro mais antigo pra exibir dentro de cada coluna
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const cols: BoardColumns = { todo: [], in_progress: [], waiting: [], done: [] };
    combined.forEach(item => {
      const st = item.status || 'todo';
      if (cols[st as keyof BoardColumns]) cols[st as keyof BoardColumns].push(item);
      else cols.todo.push(item);
    });
    
    setBoard(cols);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [activeSpace])
  );

  const moveDirectly = async (item: FeedItem, direction: 'prev' | 'next') => {
    const currentIndex = STATUS_ORDER.indexOf(item.status);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    const newStatus = STATUS_ORDER[nextIndex];
    if (!newStatus) return;

    const tableName = item.type === 'task' ? 'tasks' 
                    : item.type === 'notice' ? 'notices'
                    : item.type === 'event' ? 'events'
                    : item.type === 'list' ? 'lists'
                    : 'ideas';

    // Atualização otimista na interface (instantâneo)
    setBoard(prev => {
       const newBoard = { ...prev };
       // Remove da velha
       newBoard[item.status as keyof BoardColumns] = newBoard[item.status as keyof BoardColumns].filter(i => i.id !== item.id);
       // Adiciona na nova (no topo)
       const updatedItem = { ...item, status: newStatus };
       newBoard[newStatus as keyof BoardColumns] = [updatedItem, ...newBoard[newStatus as keyof BoardColumns]];
       return newBoard;
    });

    // Atualização no banco
    const { error } = await supabase.from(tableName).update({ status: newStatus }).eq('id', item.id);
    if (error) {
       alert('Erro ao mover o item.');
       fetchFeed(); // Reverte em caso de erro
    }
  };

  const renderCardFooter = (item: FeedItem) => {
    const currentIndex = STATUS_ORDER.indexOf(item.status);
    const canMoveLeft = currentIndex > 0;
    const canMoveRight = currentIndex < STATUS_ORDER.length - 1;

    const handleDelete = async () => {
      const confirmDelete = () => {
        return new Promise((resolve) => {
          if (Platform.OS === 'web') {
            resolve(window.confirm('Tem certeza que deseja excluir?'));
          } else {
            Alert.alert('Excluir', 'Tem certeza?', [
              { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Excluir', onPress: () => resolve(true), style: 'destructive' }
            ]);
          }
        });
      };

      const isConfirmed = await confirmDelete();
      if (!isConfirmed) return;
      
      const tableName = item.type === 'task' ? 'tasks' 
        : item.type === 'notice' ? 'notices' 
        : item.type === 'event' ? 'events' 
        : item.type === 'list' ? 'lists' 
        : 'ideas';

      const { error } = await supabase.from(tableName).delete().eq('id', item.id);
      if (error) {
        if (Platform.OS === 'web') alert('Erro ao excluir: ' + error.message);
        else Alert.alert('Erro', 'Não foi possível excluir: ' + error.message);
      } else {
        fetchFeed();
      }
    };

    return (
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {canMoveLeft && (
            <TouchableOpacity onPress={() => moveDirectly(item, 'prev')} style={styles.arrowBtn}>
              <Feather name="chevron-left" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          {canMoveRight && (
            <TouchableOpacity onPress={() => moveDirectly(item, 'next')} style={styles.arrowBtn}>
              <Feather name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={handleDelete} style={[styles.arrowBtn, { backgroundColor: '#ffebee' }]}>
          <Feather name="trash-2" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCard = (item: FeedItem) => {
    if (item.type === 'notice') {
      return (
        <TouchableOpacity key={item.id + 'notice'} onPress={() => router.push(`/(main)/recado/${item.id}` as any)} activeOpacity={0.8}>
          <Card elevation="level1" style={styles.noticeCard}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" /> : null}
            <Text style={styles.noticeText}>📌 {item.text}</Text>
            {renderCardFooter(item)}
          </Card>
        </TouchableOpacity>
      );
    }
    if (item.type === 'event') {
      const dateObj = new Date(item.start_time!);
      const formattedDate = dateObj.toLocaleDateString('pt-BR');
      const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return (
        <TouchableOpacity key={item.id + 'event'} onPress={() => router.push(`/(main)/compromisso/${item.id}` as any)} activeOpacity={0.8}>
          <Card elevation="level1" style={styles.eventCard}>
            <View style={styles.eventLeft}>
              <Text style={styles.eventDateText}>{formattedDate}</Text>
              <Text style={styles.eventTimeText}>{formattedTime}</Text>
            </View>
            <View style={styles.eventRight}>
              {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" /> : null}
              <Text style={styles.taskTitle}>📅 {item.title}</Text>
              {item.description ? <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text> : null}
              {renderCardFooter(item)}
            </View>
          </Card>
        </TouchableOpacity>
      );
    }
    if (item.type === 'list') {
      return (
        <TouchableOpacity key={item.id + 'list'} onPress={() => router.push(`/(main)/lista/${item.id}` as any)} activeOpacity={0.8}>
          <Card elevation="level1" style={styles.listCard}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" /> : null}
            <Text style={styles.listTitle}>📋 {item.title}</Text>
            {renderCardFooter(item)}
          </Card>
        </TouchableOpacity>
      );
    }
    if (item.type === 'idea') {
      return (
        <TouchableOpacity key={item.id + 'idea'} onPress={() => router.push(`/(main)/ideia/${item.id}` as any)} activeOpacity={0.8}>
          <Card elevation="level1" style={styles.ideaCard}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" /> : null}
            <Text style={styles.ideaTitle}>💡 {item.title}</Text>
            {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
            {renderCardFooter(item)}
          </Card>
        </TouchableOpacity>
      );
    }
    // type === 'task'
    return (
      <TouchableOpacity key={item.id + 'task'} onPress={() => router.push(`/(main)/tarefa/${item.id}` as any)} activeOpacity={0.8}>
        <Card elevation="level1" style={[styles.taskCard, item.status === 'done' && styles.taskCardCompleted]}>
          {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" /> : null}
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleCompleted]}>✅ {item.title}</Text>
            <View style={[styles.badge, styles[`priority_${item.priority}` as keyof typeof styles]]}>
              <Text style={styles.badgeText}>{item.priority}</Text>
            </View>
          </View>
          {item.description ? <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text> : null}
          {renderCardFooter(item)}
        </Card>
      </TouchableOpacity>
    );
  };

  if (!activeSpace) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nenhum espaço selecionado</Text>
        <Text style={styles.emptyText}>Selecione um espaço no menu lateral para ver as tarefas.</Text>
      </View>
    );
  }

  // Responsividade do Kanban
  const isDesktop = width >= 1024;
  const gap = 16;
  const padding = theme.spacing.lg * 2;
  // 4 colunas no Desktop, ou 85% da tela no Mobile
  const columnWidth = isDesktop ? (width - padding - (gap * 3) - 250) / 4 : width * 0.85; 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeSpace.name} 🏠</Text>
          <Text style={styles.subtitle}>Espaço para organização das rotinas e projetos.</Text>
        </View>
        <View style={styles.headerActions}>
          <Button title="✨ Novo item no espaço" onPress={() => setIsAddModalOpen(true)} />
        </View>
      </View>

      {loading ? (
         <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          snapToInterval={isDesktop ? 0 : columnWidth + gap}
          decelerationRate="fast"
          style={{ flex: 1 }}
          contentContainerStyle={styles.boardScroll}
        >
          {/* Coluna 1: A Fazer */}
          <View style={[styles.boardColumn, { width: columnWidth }]}>
            <View style={styles.columnHeader}>
              <View style={[styles.columnDot, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.columnTitle}>A Fazer</Text>
              <View style={styles.columnCount}><Text style={styles.columnCountText}>{board.todo.length}</Text></View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {board.todo.map(renderCard)}
            </ScrollView>
          </View>

          {/* Coluna 2: Em Andamento */}
          <View style={[styles.boardColumn, { width: columnWidth }]}>
            <View style={styles.columnHeader}>
              <View style={[styles.columnDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.columnTitle}>Em Andamento</Text>
              <View style={styles.columnCount}><Text style={styles.columnCountText}>{board.in_progress.length}</Text></View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {board.in_progress.map(renderCard)}
            </ScrollView>
          </View>

          {/* Coluna 3: Aguardando */}
          <View style={[styles.boardColumn, { width: columnWidth }]}>
            <View style={styles.columnHeader}>
              <View style={[styles.columnDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.columnTitle}>Aguardando</Text>
              <View style={styles.columnCount}><Text style={styles.columnCountText}>{board.waiting.length}</Text></View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {board.waiting.map(renderCard)}
            </ScrollView>
          </View>

          {/* Coluna 4: Concluído */}
          <View style={[styles.boardColumn, { width: columnWidth }]}>
            <View style={styles.columnHeader}>
              <View style={[styles.columnDot, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.columnTitle}>Concluído</Text>
              <View style={styles.columnCount}><Text style={styles.columnCountText}>{board.done.length}</Text></View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {board.done.map(renderCard)}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* Modal de Criação Interativo */}
      <Modal visible={isAddModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                <Text style={styles.modalTitle}>🔴 O que você quer adicionar?</Text>
                <Text style={styles.modalSubtitle}>Selecione o formato ideal para registrar no {activeSpace?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flexShrink: 1, marginVertical: theme.spacing.sm }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalGrid}>
              <TouchableOpacity style={[styles.modalOption, { width: isDesktop ? '48%' : '100%' }]} onPress={() => { setIsAddModalOpen(false); router.push('/(main)/criar-tarefa' as any); }}>
                <View style={[styles.modalIconBg, { backgroundColor: '#e8f5e9' }]}><Text style={styles.modalIcon}>✅</Text></View>
                <View style={styles.modalOptionTexts}>
                  <Text style={styles.modalOptionTitle}>Tarefa</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalOption, { width: isDesktop ? '48%' : '100%' }]} onPress={() => { setIsAddModalOpen(false); router.push('/(main)/criar-recado' as any); }}>
                <View style={[styles.modalIconBg, { backgroundColor: '#fff3e0' }]}><Text style={styles.modalIcon}>📌</Text></View>
                <View style={styles.modalOptionTexts}>
                  <Text style={styles.modalOptionTitle}>Recado</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalOption, { width: isDesktop ? '48%' : '100%' }]} onPress={() => { setIsAddModalOpen(false); router.push('/(main)/criar-compromisso' as any); }}>
                <View style={[styles.modalIconBg, { backgroundColor: '#ffebee' }]}><Text style={styles.modalIcon}>📅</Text></View>
                <View style={styles.modalOptionTexts}>
                  <Text style={styles.modalOptionTitle}>Compromisso</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalOption, { width: isDesktop ? '48%' : '100%' }]} onPress={() => { setIsAddModalOpen(false); router.push('/(main)/criar-lista' as any); }}>
                <View style={[styles.modalIconBg, { backgroundColor: '#e0f7fa' }]}><Text style={styles.modalIcon}>📋</Text></View>
                <View style={styles.modalOptionTexts}>
                  <Text style={styles.modalOptionTitle}>Lista</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalOption, { width: isDesktop ? '48%' : '100%' }]} onPress={() => { setIsAddModalOpen(false); router.push('/(main)/criar-ideia' as any); }}>
                <View style={[styles.modalIconBg, { backgroundColor: '#fffde7' }]}><Text style={styles.modalIcon}>💡</Text></View>
                <View style={styles.modalOptionTexts}>
                  <Text style={styles.modalOptionTitle}>Ideia</Text>
                </View>
              </TouchableOpacity>
            </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={[styles.modalFooterText, { flex: 1, paddingRight: 8 }]} numberOfLines={2}>
                🏠 Adicionando em: <Text style={{fontWeight: 'bold'}}>{activeSpace?.name}</Text>
              </Text>
              <Button title="Cancelar" variant="ghost" onPress={() => setIsAddModalOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { padding: theme.spacing.lg, paddingBottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg, flexWrap: 'wrap', gap: 16 },
  headerActions: { flexDirection: 'row', gap: theme.spacing.sm },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginTop: 4 },
  emptyText: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textMuted },
  
  // Kanban Board
  boardScroll: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl, gap: 16, flexGrow: 1 },
  boardColumn: { backgroundColor: '#f0f2f5', borderRadius: theme.radius.lg, padding: theme.spacing.md, flex: 1 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  columnDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  columnTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, flex: 1 },
  columnCount: { backgroundColor: '#e4e6ea', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  columnCountText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  arrowBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  arrowBtnText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: 'bold', marginHorizontal: 4 },

  // Cards
  cardImage: { width: '100%', height: 120, borderRadius: 6, marginBottom: theme.spacing.sm },
  taskCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#e8f5e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' },
  taskCardCompleted: { borderLeftColor: theme.colors.success, opacity: 0.6 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, flex: 1 },
  taskTitleCompleted: { textDecorationLine: 'line-through' },
  taskDesc: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  priority_high: { backgroundColor: theme.colors.error },
  priority_medium: { backgroundColor: theme.colors.warning },
  priority_low: { backgroundColor: theme.colors.secondary },
  
  noticeCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#fff3e0', borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  noticeText: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textPrimary, fontStyle: 'italic' },
  
  eventCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', borderLeftWidth: 4, borderLeftColor: '#f44336' },
  eventLeft: { paddingRight: theme.spacing.md, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.1)', marginRight: theme.spacing.md, alignItems: 'center', minWidth: 60 },
  eventRight: { flex: 1 },
  eventDateText: { fontSize: theme.typography.sizes.bodySm, fontWeight: 'bold', color: '#f44336' },
  eventTimeText: { fontSize: theme.typography.sizes.bodyLg, fontWeight: 'bold', color: theme.colors.textPrimary },
  
  listCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#e0f7fa', borderLeftWidth: 4, borderLeftColor: '#00bcd4' },
  listTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary },
  
  ideaCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, backgroundColor: '#fffde7', borderLeftWidth: 4, borderLeftColor: '#ffeb3b' },
  ideaTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },

  // --- Modal Styles ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  modalContent: { backgroundColor: theme.colors.surface, width: '100%', maxWidth: 700, maxHeight: '90%', borderRadius: theme.radius.lg, padding: theme.spacing.lg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  modalTitle: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 2 },
  modalSubtitle: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary },
  modalCloseBtn: { padding: 4 },
  modalCloseText: { fontSize: 20, color: theme.colors.textSecondary },
  
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  modalIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  modalIcon: { fontSize: 18 },
  modalOptionTexts: { flex: 1 },
  modalOptionTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary },

  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md, borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: theme.spacing.sm },
  modalFooterText: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary }
});
