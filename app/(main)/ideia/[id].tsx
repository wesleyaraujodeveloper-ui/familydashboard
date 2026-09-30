import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../src/theme';
import { useGroup } from '../../../src/store/group';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Comments } from '../../../src/components/Comments';
import { supabase } from '../../../src/services/supabase';

export default function IdeiaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeGroup } = useGroup();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ideas').select('*').eq('id', id).single();
    if (error || !data) {
      alert('Ideia não encontrada');
      if (router.canGoBack()) router.back();
      else router.replace('/(main)/mural' as any);
      return;
    }
    setIdea(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir Ideia? Tem certeza que deseja apagar?')) {
        supabase.from('ideas').delete().eq('id', id).then(() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        });
      }
    } else {
      Alert.alert('Excluir Ideia', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
          await supabase.from('ideas').delete().eq('id', id);
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        }}
      ]);
    }
  };

  if (loading || !idea) return <View style={styles.container}><Text>Carregando...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card elevation="level1" style={styles.card}>
        <Text style={styles.title}>💡 {idea.title}</Text>
        {idea.description ? <Text style={styles.desc}>{idea.description}</Text> : null}
      </Card>

      <Comments entityType="ideas" entityId={idea.id} spaceId={idea.space_id} groupId={activeGroup?.id || ''} entityTitle={idea.title} />

      <Button title="Excluir Ideia" variant="ghost" onPress={handleDelete} style={{ marginTop: theme.spacing.lg, marginBottom: 40 }} />
      <Button title="Voltar" variant="secondary" onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(main)/mural' as any); }} style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  card: { padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  desc: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary }
});
