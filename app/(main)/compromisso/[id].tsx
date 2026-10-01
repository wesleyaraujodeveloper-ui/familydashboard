import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../../src/theme/useAppTheme';
import { useGroup } from '../../../src/store/group';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Comments } from '../../../src/components/Comments';
import { supabase } from '../../../src/services/supabase';

export default function CompromissoDetailsScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeGroup } = useGroup();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error || !data) {
      alert('Evento não encontrado');
      if (router.canGoBack()) router.back();
      else router.replace('/(main)/mural' as any);
      return;
    }
    setEvent(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir Compromisso? Tem certeza que deseja apagar?')) {
        supabase.from('events').delete().eq('id', id).then(() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        });
      }
    } else {
      Alert.alert('Excluir Compromisso', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
          await supabase.from('events').delete().eq('id', id);
          if (router.canGoBack()) router.back();
          else router.replace('/(main)/mural' as any);
        }}
      ]);
    }
  };

  if (loading || !event) return <View style={styles.container}><Text>Carregando...</Text></View>;

  const dateObj = new Date(event.start_time);
  const formattedDate = dateObj.toLocaleDateString('pt-BR');
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <ScrollView style={styles.container}>
      <Card elevation="level1" style={styles.card}>
        <Text style={styles.title}>📅 {event.title}</Text>
        <Text style={styles.dateTime}>Data: {formattedDate} às {formattedTime}</Text>
        {event.description ? <Text style={styles.desc}>{event.description}</Text> : null}
      </Card>

      <Comments entityType="events" entityId={event.id} spaceId={event.space_id} groupId={activeGroup?.id || ''} entityTitle={event.title} />

      <Button title="Excluir Compromisso" variant="ghost" onPress={handleDelete} style={{ marginTop: theme.spacing.lg, marginBottom: 40 }} />
      <Button title="Voltar" variant="secondary" onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(main)/mural' as any); }} style={{ marginBottom: 100 }} />
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  card: { padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  dateTime: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.primary, fontWeight: 'bold', marginBottom: theme.spacing.sm },
  desc: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary }
});
