import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';

export default function CriarEspacoScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { activeGroup } = useGroup();
  const { spaces, setSpaces, setActiveSpace } = useSpace();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !activeGroup) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('spaces')
      .insert([{ name: name.trim(), group_id: activeGroup.id }])
      .select()
      .single();

    setLoading(false);

    if (error || !data) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível criar o espaço.');
      return;
    }

    // Atualiza a store local para aparecer instantaneamente no menu
    const newSpaces = [...spaces, data];
    setSpaces(newSpaces);
    setActiveSpace(data);
    
    // Volta para o mural que vai ler o novo activeSpace
    router.replace('/(main)/mural' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Espaço</Text>
      <Text style={styles.subtitle}>Um espaço é como um quadro (ex: "Férias", "Reforma").</Text>
      
      <Card elevation="level1" style={styles.card}>
        <Input 
          label="Nome do Espaço" 
          placeholder="Ex: Viagem 2027" 
          value={name} 
          onChangeText={setName} 
        />
        <Button 
          title="Salvar Espaço" 
          onPress={handleCreate} 
          isLoading={loading} 
          style={{marginTop: theme.spacing.md}} 
        />
        <Button 
          title="Cancelar" 
          variant="ghost" 
          onPress={() => router.back()} 
          style={{marginTop: theme.spacing.sm}} 
        />
      </Card>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, width: '100%' },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  card: { padding: theme.spacing.xl }
});
