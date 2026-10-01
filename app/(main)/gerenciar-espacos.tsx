import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../src/services/supabase';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';

export default function GerenciarEspacosScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { activeGroup } = useGroup();
  const { spaces, setSpaces, activeSpace, setActiveSpace } = useSpace();
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (spaceId: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('Tem certeza que deseja apagar este espaço? Todos os itens dele serão perdidos.')) return;
    } else {
      Alert.alert('Atenção', 'Tem certeza que deseja apagar este espaço?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => performDelete(spaceId) }
      ]);
      return;
    }
    await performDelete(spaceId);
  };

  const performDelete = async (spaceId: string) => {
    setLoading(true);
    const { error } = await supabase.from('spaces').delete().eq('id', spaceId);
    setLoading(false);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      const newSpaces = spaces.filter(s => s.id !== spaceId);
      setSpaces(newSpaces);
      if (activeSpace?.id === spaceId) {
        setActiveSpace(newSpaces.length > 0 ? newSpaces[0] : (null as any));
      }
    }
  };

  const startEdit = (spaceId: string, currentName: string) => {
    setEditingSpaceId(spaceId);
    setEditName(currentName);
  };

  const saveEdit = async (spaceId: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('spaces').update({ name: editName.trim() }).eq('id', spaceId);
    setLoading(false);

    if (error) {
      alert('Erro ao atualizar: ' + error.message);
    } else {
      const newSpaces = spaces.map(s => s.id === spaceId ? { ...s, name: editName.trim() } : s);
      setSpaces(newSpaces);
      if (activeSpace?.id === spaceId) {
        setActiveSpace(newSpaces.find(s => s.id === spaceId) || (null as any));
      }
      setEditingSpaceId(null);
      setEditName('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Gerenciar Espaços</Text>
        <Button title="+ Novo" onPress={() => router.push('/(main)/criar-espaco' as any)} />
      </View>
      <Text style={styles.subtitle}>Grupo: {activeGroup?.name}</Text>
      
      <Card elevation="level1" style={styles.card}>
        {spaces.length === 0 ? (
          <Text style={styles.empty}>Nenhum espaço criado.</Text>
        ) : (
          spaces.map(space => (
            <View key={space.id} style={styles.itemRow}>
              {editingSpaceId === space.id ? (
                <View style={styles.editRow}>
                  <TextInput 
                    style={styles.editInput} 
                    value={editName} 
                    onChangeText={setEditName} 
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => saveEdit(space.id)} style={[styles.iconButton, { backgroundColor: theme.colors.primary }]}>
                    <Feather name="check" size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingSpaceId(null)} style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}>
                    <Feather name="x" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.viewRow}>
                  <Text style={styles.spaceName}>{space.name}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => startEdit(space.id, space.name)} style={styles.iconButton}>
                      <Feather name="edit-2" size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(space.id)} style={styles.iconButton}>
                      <Feather name="trash-2" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </Card>
      
      <Button 
        title="Voltar ao Mural" 
        variant="secondary" 
        onPress={() => router.replace('/(main)/mural' as any)} 
        style={{ marginTop: theme.spacing.xl, marginBottom: 40 }} 
      />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, width: '100%', marginHorizontal: 'auto' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  card: { padding: theme.spacing.md },
  empty: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textMuted, textAlign: 'center', marginVertical: theme.spacing.lg },
  itemRow: { borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: theme.spacing.md },
  viewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spaceName: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textPrimary, fontWeight: '500' },
  actions: { flexDirection: 'row' },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  editInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8, padding: 8, fontSize: 16, backgroundColor: 'white', marginRight: 8 },
  iconButton: { padding: 8, marginLeft: 8, borderRadius: 8, backgroundColor: '#f0f2f5' }
});
