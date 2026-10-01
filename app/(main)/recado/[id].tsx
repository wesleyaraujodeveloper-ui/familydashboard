import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../../src/theme/useAppTheme';
import { useGroup } from '../../../src/store/group';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Comments } from '../../../src/components/Comments';
import { supabase } from '../../../src/services/supabase';

export default function RecadoDetailsScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeGroup } = useGroup();
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('notices').select('*').eq('id', id).single();
    if (error || !data) {
      alert('Recado não encontrado');
      if (router.canGoBack()) router.back();
      else router.replace('/(main)/mural' as any);
      return;
    }
    setNotice(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir Recado? Tem certeza que deseja apagar?')) {
        supabase.from('notices').delete().eq('id', id).then(() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        });
      }
    } else {
      Alert.alert('Excluir Recado', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
          await supabase.from('notices').delete().eq('id', id);
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        }}
      ]);
    }
  };

  if (loading || !notice) return <View style={styles.container}><Text>Carregando...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card elevation="level1" style={styles.card}>
        <Text style={styles.title}>📌 Recado</Text>
        <Text style={styles.desc}>{notice.text}</Text>
      </Card>

      <Comments entityType="notices" entityId={notice.id} spaceId={notice.space_id} groupId={activeGroup?.id || ''} entityTitle={notice.text} />

      <Button title="Excluir Recado" variant="ghost" onPress={handleDelete} style={{ marginTop: theme.spacing.lg, marginBottom: 40 }} />
      <Button title="Voltar" variant="secondary" onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(main)/mural' as any); }} style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  card: { padding: theme.spacing.xl, marginBottom: theme.spacing.md, backgroundColor: '#fff9c4' },
  title: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  desc: { fontSize: theme.typography.sizes.headlineSm, color: theme.colors.textPrimary, fontStyle: 'italic' }
});
