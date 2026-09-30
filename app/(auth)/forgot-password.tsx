import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Preencha seu e-mail');
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    setLoading(false);
    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso', 'Um link de recuperação foi enviado para o seu e-mail.');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>Enviaremos as instruções para o seu e-mail.</Text>
        <Card elevation="level1" style={styles.card}>
          <Input label="E-mail" placeholder="seu@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Button title="Enviar Link" onPress={handleReset} isLoading={loading} style={{ marginTop: theme.spacing.lg }} />
        </Card>
        <View style={styles.footer}>
          <Link href="/(auth)/login" style={styles.link}>Voltar para o Login</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, maxWidth: 400, marginHorizontal: 'auto', width: '100%' },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl, marginTop: theme.spacing.sm },
  card: { padding: theme.spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl },
  link: { color: theme.colors.primary, fontWeight: '600', fontSize: theme.typography.sizes.bodyMd }
});
