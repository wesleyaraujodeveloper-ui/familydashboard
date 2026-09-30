import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../src/theme';
import { useGroup } from '../../../src/store/group';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Comments } from '../../../src/components/Comments';
import { supabase } from '../../../src/services/supabase';

export default function TarefaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeGroup } = useGroup();
  const [task, setTask] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTaskDetails = async () => {
    setLoading(true);
    // 1. Fetch Task
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (taskError || !taskData) {
      Alert.alert('Erro', 'Tarefa não encontrada');
      router.back();
      return;
    }
    setTask(taskData);

    // 2. Fetch Checklists
    const { data: checkData } = await supabase
      .from('task_checklists')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: true });
    
    if (checkData) setChecklists(checkData);

    setLoading(false);
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleToggleChecklist = async (itemId: string, currentStatus: boolean) => {
    setChecklists(prev => prev.map(c => c.id === itemId ? { ...c, is_completed: !currentStatus } : c));
    await supabase.from('task_checklists').update({ is_completed: !currentStatus }).eq('id', itemId);
  };

  const handleAddChecklist = async () => {
    if (!newItem.trim()) return;
    
    const title = newItem.trim();
    setNewItem('');

    const { data, error } = await supabase
      .from('task_checklists')
      .insert([{ task_id: id, title, is_completed: false }])
      .select()
      .single();

    if (!error && data) {
      setChecklists(prev => [...prev, data]);
    }
  };

  const handleDeleteTask = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir Tarefa? Tem certeza que deseja apagar?')) {
        await supabase.from('tasks').delete().eq('id', id);
        router.back();
      }
    } else {
      Alert.alert('Excluir Tarefa', 'Tem certeza que deseja apagar?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
          await supabase.from('tasks').delete().eq('id', id);
          router.back();
        }}
      ]);
    }
  };

  const handleCompleteTask = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    setTask({ ...task, status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
  };

  if (loading || !task) return <View style={styles.container}><Text>Carregando...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card elevation="level1" style={[styles.card, task.status === 'completed' && styles.cardCompleted]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, task.status === 'completed' && styles.titleCompleted]}>{task.title}</Text>
          <View style={[styles.badge, (styles as any)[`priority_${task.priority}`]]}>
            <Text style={styles.badgeText}>{task.priority}</Text>
          </View>
        </View>

        {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}

        <View style={styles.actions}>
          <Button 
            title={task.status === 'completed' ? "Reabrir Tarefa" : "Concluir Tarefa"} 
            variant={task.status === 'completed' ? "secondary" : "primary"} 
            onPress={handleCompleteTask} 
          />
        </View>
      </Card>

      <Card elevation="level1" style={styles.card}>
        <Text style={styles.sectionTitle}>Checklist</Text>
        
        {checklists.map(item => (
          <TouchableOpacity key={item.id} style={styles.checkItem} onPress={() => handleToggleChecklist(item.id, item.is_completed)}>
            <View style={[styles.checkbox, item.is_completed && styles.checkboxActive]} />
            <Text style={[styles.checkText, item.is_completed && styles.checkTextDone]}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.addCheckRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input placeholder="Novo item..." value={newItem} onChangeText={setNewItem} />
          </View>
          <Button title="+" onPress={handleAddChecklist} style={{ paddingHorizontal: 20 }} />
        </View>
      </Card>

      <Comments entityType="tasks" entityId={task.id} spaceId={task.space_id} groupId={activeGroup?.id || ''} entityTitle={task.title} />

      <Button title="Excluir Tarefa" variant="ghost" onPress={handleDeleteTask} style={{ marginTop: theme.spacing.lg, marginBottom: 40 }} />
      <Button title="Voltar" variant="secondary" onPress={() => router.back()} style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  card: { padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  cardCompleted: { opacity: 0.7, backgroundColor: theme.colors.surfaceSubdued },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary, flex: 1 },
  titleCompleted: { textDecorationLine: 'line-through', color: theme.colors.textSecondary },
  desc: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  actions: { marginTop: theme.spacing.xl, borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: theme.spacing.md },
  
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  priority_high: { backgroundColor: theme.colors.error },
  priority_medium: { backgroundColor: theme.colors.warning },
  priority_low: { backgroundColor: theme.colors.secondary },

  sectionTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: theme.colors.border, marginRight: theme.spacing.sm },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkText: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textPrimary },
  checkTextDone: { textDecorationLine: 'line-through', color: theme.colors.textMuted },
  
  addCheckRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md }
});
