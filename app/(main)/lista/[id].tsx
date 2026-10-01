import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../../src/theme/useAppTheme';
import { useGroup } from '../../../src/store/group';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Comments } from '../../../src/components/Comments';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../src/services/supabase';

export default function ListaDetailsScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeGroup } = useGroup();
  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchListDetails = async () => {
    setLoading(true);
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError || !listData) {
      alert('Lista não encontrada');
      if (router.canGoBack()) router.back();
      else router.replace('/(main)/mural' as any);
      return;
    }
    setList(listData);

    const { data: itemsData } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', id)
      .order('created_at', { ascending: true });
    
    if (itemsData) setItems(itemsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchListDetails();
  }, [id]);

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    setItems(prev => prev.map(c => c.id === itemId ? { ...c, is_completed: !currentStatus } : c));
    await supabase.from('list_items').update({ is_completed: !currentStatus }).eq('id', itemId);
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    
    const content = newItem.trim();
    setNewItem('');

    const { data, error } = await supabase
      .from('list_items')
      .insert([{ list_id: id, content, is_completed: false }])
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [...prev, data]);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    // Soft delete otimista na interface
    setItems(prev => prev.filter(c => c.id !== itemId));
    // Remove do banco
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);
    if (error) {
      alert('Erro ao excluir item: ' + error.message);
      fetchListDetails(); // reverte a lista
    }
  };

  const handleDeleteList = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Tem certeza que deseja apagar esta lista?')) {
        supabase.from('lists').delete().eq('id', id).then(() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        });
      }
    } else {
      Alert.alert('Excluir Lista', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
          await supabase.from('lists').delete().eq('id', id);
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        }}
      ]);
    }
  };

  if (loading || !list) return <View style={styles.container}><Text>Carregando...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card elevation="level1" style={styles.card}>
        <Text style={styles.title}>{list.title}</Text>
        
        <View style={styles.listContainer}>
          {items.map(item => (
            <View key={item.id} style={[styles.checkItem, { justifyContent: 'space-between' }]}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => handleToggleItem(item.id, item.is_completed)}>
                <View style={[styles.checkbox, item.is_completed && styles.checkboxActive]} />
                <Text style={[styles.checkText, item.is_completed && styles.checkTextDone]}>{item.content}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Feather name="trash-2" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.addCheckRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input placeholder="Adicionar à lista..." value={newItem} onChangeText={setNewItem} />
          </View>
          <Button title="+" onPress={handleAddItem} style={{ paddingHorizontal: 20 }} />
        </View>
      </Card>

      <Comments entityType="lists" entityId={list.id} spaceId={list.space_id} groupId={activeGroup?.id || ''} entityTitle={list.title} />

      <Button title="Excluir Lista" variant="ghost" onPress={handleDeleteList} style={{ marginTop: theme.spacing.lg, marginBottom: 40 }} />
      <Button title="Voltar" variant="secondary" onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(main)/mural' as any); }} style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  card: { padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.xl },
  
  listContainer: { marginBottom: theme.spacing.md },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, marginRight: theme.spacing.md },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkText: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textPrimary },
  checkTextDone: { textDecorationLine: 'line-through', color: theme.colors.textMuted },
  
  addCheckRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md, borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: theme.spacing.md }
});
