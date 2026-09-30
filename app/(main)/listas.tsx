import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { theme } from '../../src/theme';
import { supabase } from '../../src/services/supabase';
import { useSpace } from '../../src/store/space';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ListasScreen() {
  const { activeSpace } = useSpace();
  const router = useRouter();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLists = async () => {
    if (!activeSpace) return;
    
    // Buscar listas
    const { data, error } = await supabase
      .from('lists')
      .select('*, list_items(id, is_completed)')
      .eq('space_id', activeSpace.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLists(data);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchLists();
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeSpace])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FEF3C7', '#FFFBEB', '#FFFFFF']} style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Minhas Listas</Text>
            <Text style={styles.subtitle}>Supermercado, checklists e compras</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/(main)/criar-lista' as any)}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="check-square" size={48} color="#D97706" style={{ opacity: 0.5 }} />
            </View>
            <Text style={styles.emptyText}>Nenhuma lista por aqui.</Text>
            <Text style={styles.emptySubtext}>Crie sua primeira lista de compras ou checklist para começar a organizar.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(main)/criar-lista' as any)}>
              <Text style={styles.emptyBtnText}>Criar Nova Lista</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listGrid}>
            {lists.map(list => {
              const totalItems = list.list_items ? list.list_items.length : 0;
              const completedItems = list.list_items ? list.list_items.filter((i: any) => i.is_completed).length : 0;
              const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
              
              const isCompleted = progress === 100 && totalItems > 0;

              return (
                <TouchableOpacity 
                  key={list.id} 
                  style={[styles.listCard, isCompleted && styles.listCardCompleted]} 
                  onPress={() => router.push(`/(main)/lista/${list.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <View style={[styles.iconBox, isCompleted ? { backgroundColor: '#DCFCE7' } : {}]}>
                        <Feather name="list" size={18} color={isCompleted ? '#16A34A' : '#D97706'} />
                      </View>
                      <Text style={[styles.listTitle, isCompleted && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {list.title}
                      </Text>
                    </View>
                  </View>
                  
                  {list.image_url && (
                    <Image source={{ uri: list.image_url }} style={styles.listImage} />
                  )}

                  <View style={styles.cardFooter}>
                    <View style={styles.metaInfo}>
                      <Feather name="check-circle" size={14} color={isCompleted ? '#16A34A' : theme.colors.textSecondary} />
                      <Text style={[styles.metaText, isCompleted && { color: '#16A34A', fontWeight: 'bold' }]}>
                        {completedItems} de {totalItems} itens
                      </Text>
                    </View>
                    
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isCompleted ? '#16A34A' : '#F59E0B' }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBEB' },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 100, maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.headlineLg,
    fontWeight: 'bold',
    color: '#92400E', // Dark Amber
  },
  subtitle: {
    fontSize: theme.typography.sizes.bodyLg,
    color: '#B45309',
    marginTop: 4,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  listGrid: {
    gap: theme.spacing.md,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  listCardCompleted: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E5E5E5',
    opacity: 0.9,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTitle: {
    fontSize: theme.typography.sizes.headlineSm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    marginTop: 6,
  },
  listImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    resizeMode: 'cover',
  },
  cardFooter: {
    marginTop: theme.spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: theme.typography.sizes.bodySm,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    marginTop: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.sizes.headlineSm,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.bodyMd,
    color: '#B45309',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: theme.spacing.xl,
  },
  emptyBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
