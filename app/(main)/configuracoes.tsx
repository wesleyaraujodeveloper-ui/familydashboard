import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView, Switch } from 'react-native';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/store/auth';
import { useGroup } from '../../src/store/group';
import { supabase } from '../../src/services/supabase';
import { useThemeStore } from '../../src/store/theme';

export default function SettingsScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user, signOut } = useAuth();
  const { activeGroup, setActiveGroup, setGroups } = useGroup();
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleUpdateGroup = async () => {
    if (!newGroupName.trim() || !activeGroup) return;
    setLoading(true);

    const { error } = await supabase
      .from('groups')
      .update({ name: newGroupName.trim() })
      .eq('id', activeGroup.id);

    setLoading(false);

    if (error) {
      Alert.alert('Erro', 'Você não tem permissão para editar (apenas admins) ou houve um erro.');
    } else {
      Alert.alert('Sucesso', 'Nome da família atualizado!');
      setActiveGroup({ ...activeGroup, name: newGroupName.trim() });
      setNewGroupName('');
      // Forçar atualização da lista de grupos (ideal seria refetch, mas isso atualiza a view atual)
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert('Zona de Perigo', 'Tem certeza que deseja EXCLUIR a família inteira e todas as tarefas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim, Excluir Tudo', style: 'destructive', onPress: async () => {
        if (!activeGroup) return;
        const { error } = await supabase.from('groups').delete().eq('id', activeGroup.id);
        if (error) {
          Alert.alert('Erro', error.message);
        } else {
          // O layout principal vai ejetar o usuário para o Onboarding porque o grupo sumiu
          setGroups([]);
          setActiveGroup(null as any);
        }
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Configurações</Text>
      
      <Card elevation="level1" style={styles.card}>
        <Text style={styles.sectionTitle}>Seu Perfil</Text>
        <Text style={styles.text}>E-mail: {user?.email}</Text>
        <Text style={styles.text}>ID: {user?.id}</Text>
        <Button 
          title="Sair da Conta (Logout)" 
          variant="secondary" 
          onPress={signOut} 
          style={{ marginTop: theme.spacing.md, alignSelf: 'flex-start' }}
        />
      </Card>

      <Card elevation="level1" style={styles.card}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.sm }}>
          <Text style={styles.text}>Modo Escuro</Text>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </Card>

      <Card elevation="level1" style={styles.card}>
        <Text style={styles.sectionTitle}>Gerenciar: {activeGroup?.name}</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
          <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
            <Input 
              label="Renomear Família" 
              placeholder="Novo nome" 
              value={newGroupName} 
              onChangeText={setNewGroupName} 
            />
          </View>
          <Button title="Salvar" onPress={handleUpdateGroup} isLoading={loading} style={{ marginTop: 6 }} />
        </View>

        <Button 
          title="Excluir Família Permanentemente" 
          variant="ghost" 
          onPress={handleDeleteGroup} 
          style={{ marginTop: theme.spacing.xl, alignSelf: 'flex-start' }}
        />
      </Card>

      <View style={styles.brandContainer}>
        <View style={styles.brandLogoWrapper}>
          <Image 
            source={require('../../assets/images/we-logo.png')} 
            style={styles.brandLogo} 
            resizeMode="cover"
          />
        </View>
        <Text style={styles.brandText}>Desenvolvido por We! Digital Tecnology</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.lg },
  card: { padding: theme.spacing.lg, marginBottom: theme.spacing.md, maxWidth: 600 },
  sectionTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  text: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, marginBottom: 4 },
  brandContainer: { alignItems: 'center', marginTop: theme.spacing.xxxl, paddingVertical: theme.spacing.xl, opacity: 0.8 },
  brandLogoWrapper: { width: 100, height: 100, borderRadius: 30, overflow: 'hidden', marginBottom: theme.spacing.md, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  brandLogo: { width: '100%', height: '100%', transform: [{ scale: 1.35 }] },
  brandText: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, fontWeight: 'bold' }
});
