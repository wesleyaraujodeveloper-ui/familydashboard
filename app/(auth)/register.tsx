import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    // 1. Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      Alert.alert('Falha no Cadastro', error.message);
      return;
    }

    // 2. Salva o Nome na tabela "profiles" pública
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name: name }]);
        
      if (profileError) {
        console.error('Erro ao salvar profile:', profileError);
      }
    }

    setLoading(false);
    // O auth.onAuthStateChange vai detectar a sessão e nos jogar pra tela Principal automaticamente!
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
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se à sua família no Mural</Text>

        <Card elevation="level1" style={styles.card}>
          <Input 
            label="Seu Nome" 
            placeholder="Ex: Wesley" 
            value={name}
            onChangeText={setName}
          />
          <Input 
            label="E-mail" 
            placeholder="seu@email.com" 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input 
            label="Senha (Mínimo 6 caracteres)" 
            placeholder="••••••••" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button 
            title="Cadastrar" 
            onPress={handleRegister} 
            isLoading={loading}
            style={styles.button}
          />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button 
            title="Criar com Google" 
            variant="secondary"
            onPress={handleGoogleLogin} 
            style={{ marginBottom: 16 }}
            icon={<Feather name="chrome" size={20} color={theme.colors.textPrimary} style={{ marginRight: 8 }} />}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <Link href="/(auth)/login" style={styles.link}>Fazer Login</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg, maxWidth: 400, marginHorizontal: 'auto', width: '100%' },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xxl, marginTop: theme.spacing.sm },
  card: { padding: theme.spacing.xl },
  button: { marginTop: theme.spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { marginHorizontal: theme.spacing.md, color: theme.colors.textMuted, fontSize: theme.typography.sizes.bodySm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl },
  footerText: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.bodyMd },
  link: { color: theme.colors.primary, fontWeight: '600', fontSize: theme.typography.sizes.bodyMd }
});
