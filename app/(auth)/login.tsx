import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Falha no Login', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      Alert.alert('Falha', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Mural</Text>
        <Text style={styles.subtitle}>Acesse a conta da sua família</Text>

        <Card elevation="level1" style={styles.card}>
          <Input 
            label="E-mail" 
            placeholder="seu@email.com" 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input 
            label="Senha" 
            placeholder="••••••••" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
            Esqueci minha senha
          </Link>

          <Button 
            title="Entrar" 
            onPress={handleLogin} 
            isLoading={loading}
            style={styles.button}
          />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button 
            title="Continuar com Google" 
            variant="outline"
            onPress={handleGoogleLogin} 
            style={{ marginBottom: 16 }}
            icon={<Feather name="chrome" size={20} color={theme.colors.textPrimary} style={{ marginRight: 8 }} />}
          />

        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <Link href="/(auth)/register" style={styles.link}>Criar agora</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, maxWidth: 400, marginHorizontal: 'auto', width: '100%' },
  title: { fontSize: theme.typography.sizes.headlineXl, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl, marginTop: theme.spacing.sm },
  card: { padding: theme.spacing.xl },
  forgotPassword: { color: theme.colors.primary, textAlign: 'right', marginBottom: theme.spacing.xl, fontSize: theme.typography.sizes.bodySm, fontWeight: '500' },
  button: { marginTop: theme.spacing.sm },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { marginHorizontal: theme.spacing.md, color: theme.colors.textMuted, fontSize: theme.typography.sizes.bodySm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl },
  footerText: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.bodyMd },
  link: { color: theme.colors.primary, fontWeight: '600', fontSize: theme.typography.sizes.bodyMd }
});
