import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, dê um nome para sua família.');
      return;
    }
    
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    // 1. Criar a Família (Group)
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert([{ name, created_by: userData.user.id }])
      .select('id')
      .single();

    if (groupError || !groupData) {
      console.error(groupError);
      Alert.alert('Erro', `Não foi possível criar o grupo: ${groupError?.message || 'Sem retorno'}`);
      setLoading(false);
      return;
    }

    // 2. Adicionar quem criou como Admin na tabela M-N
    const { error: memberError } = await supabase.from('group_members').insert([
      { group_id: groupData.id, profile_id: userData.user.id, role: 'admin' }
    ]);

    if (memberError) {
      console.error(memberError);
      Alert.alert('Erro', `Falha ao adicionar como membro: ${memberError.message}`);
      setLoading(false);
      return;
    }

    // 3. Criar os "Spaces" padrões da Família (Mural, Meu Dia)
    const { error: spaceError } = await supabase.from('spaces').insert([
      { group_id: groupData.id, name: 'Mural da Casa' },
      { group_id: groupData.id, name: 'Meu Dia' }
    ]);

    if (spaceError) {
      console.error(spaceError);
      Alert.alert('Erro', `Falha ao criar espaços: ${spaceError.message}`);
      setLoading(false);
      return;
    }

    setLoading(false);
    
    // Sucesso! Vamos dar um empurrão para a home, o _layout.tsx já vai capturar as mudanças
    router.replace('/(main)' as any);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erro', 'Por favor, insira um código de convite válido.');
      return;
    }

    setLoadingJoin(true);
    const { error } = await supabase.rpc('join_group_by_id', { p_group_id: inviteCode.trim() });
    
    setLoadingJoin(false);

    if (error) {
      console.error(error);
      Alert.alert('Erro', `Não foi possível entrar no grupo: ${error.message}`);
    } else {
      router.replace('/(main)' as any);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao Mural!</Text>
        <Text style={styles.subtitle}>Para começar a organizar tudo, crie um grupo para sua família ou equipe.</Text>
        
        <Card elevation="level1">
          <Input 
            label="Nome do Grupo" 
            placeholder="Ex: Família Silva" 
            value={name} 
            onChangeText={setName} 
          />
          <Button 
            title="Criar e Entrar" 
            onPress={handleCreate} 
            isLoading={loading} 
            style={{marginTop: 16}} 
          />
        </Card>
        
        <Card elevation="level1" style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 8 }}>Já tem um convite?</Text>
          <Input 
            label="Código de Convite" 
            placeholder="Cole o código aqui..." 
            value={inviteCode} 
            onChangeText={setInviteCode} 
          />
          <Button 
            title="Entrar com Código" 
            variant="secondary"
            onPress={handleJoin} 
            isLoading={loadingJoin} 
            style={{marginTop: 16}} 
          />
        </Card>
        
        <Button 
            title="Sair da Conta" 
            variant="ghost"
            onPress={handleLogout} 
            style={{marginTop: 32}} 
        />
        
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: theme.colors.textSecondary }}>Recebeu um convite? </Text>
          <Text 
            style={{ color: theme.colors.primary, fontWeight: 'bold' }} 
            onPress={() => router.push('/(onboarding)/invite' as any)}
          >
            Entrar em uma Família
          </Text>
        </View>
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
