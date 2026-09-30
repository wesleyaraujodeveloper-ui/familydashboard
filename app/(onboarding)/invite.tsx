import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';

export default function InviteScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, insira o código de convite.');
      return;
    }
    
    setLoading(true);

    const { error } = await supabase.rpc('join_group_by_id', {
      p_group_id: code.trim()
    });

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Falha no Convite', error.message || 'Código inválido.');
      return;
    }
    
    Alert.alert('Sucesso!', 'Você entrou na família.');
    router.replace('/' as any);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Entrar na Família</Text>
        <Text style={styles.subtitle}>Cole o código que o administrador enviou para você.</Text>
        
        <Card elevation="level1">
          <Input label="Código de Convite" placeholder="Ex: 550e8400-e29b..." value={code} onChangeText={setCode} />
          <Button title="Entrar" onPress={handleJoin} isLoading={loading} style={{marginTop: 16}} />
        </Card>
        
        <Button title="Voltar" variant="ghost" onPress={() => router.back()} style={{marginTop: 32}} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, maxWidth: 500, marginHorizontal: 'auto', width: '100%' },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl, marginTop: theme.spacing.sm },
});
