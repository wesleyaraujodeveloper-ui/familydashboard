import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, Alert, TouchableOpacity, Share } from 'react-native';
import { theme } from '../../src/theme';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { useGroup } from '../../src/store/group';
import { useAuth } from '../../src/store/auth';
import { supabase } from '../../src/services/supabase';
import { Avatar } from '../../src/components/ui/Avatar';

type Member = {
  role: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string;
  }
}

export default function MembersScreen() {
  const { activeGroup } = useGroup();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // O usuário logado é Admin deste grupo?
  const currentUserRole = members.find(m => m.profiles.id === user?.id)?.role;
  const isAdmin = currentUserRole === 'admin';

  const fetchMembers = async () => {
    if (!activeGroup) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        role,
        profiles (id, name, avatar_url)
      `)
      .eq('group_id', activeGroup.id);

    if (!error && data) {
      setMembers(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [activeGroup]);

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert('Remover Membro', `Tem certeza que deseja remover ${memberName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        await supabase.from('group_members').delete().match({ group_id: activeGroup?.id, profile_id: memberId });
        fetchMembers();
      }}
    ]);
  };

  const handlePromoteMember = async (memberId: string, memberName: string) => {
    Alert.alert('Promover Membro', `Tornar ${memberName} um Administrador?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Promover', style: 'default', onPress: async () => {
        await supabase.from('group_members').update({ role: 'admin' }).match({ group_id: activeGroup?.id, profile_id: memberId });
        fetchMembers();
      }}
    ]);
  };

  const handleCopyCode = async () => {
    if (activeGroup?.id) {
      await Clipboard.setStringAsync(activeGroup.id);
      Alert.alert('Copiado!', 'O código foi copiado para a área de transferência.');
    }
  };

  const handleShare = async () => {
    if (activeGroup?.id) {
      try {
        await Share.share({
          message: `Venha participar da nossa família no app Mural! Use este código de convite ao criar sua conta:\n\n${activeGroup.id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membros da Família</Text>
      
      <Card elevation="level1" style={styles.inviteCard}>
        <Text style={styles.inviteTitle}>Convide alguém para a Família</Text>
        <Text style={styles.inviteText}>
          Copie o código abaixo e envie para a pessoa. Ela deverá colar esse código ao criar uma conta.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText} selectable={true}>
            {activeGroup?.id}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, justifyContent: 'center' }}>
          <TouchableOpacity onPress={handleCopyCode} style={styles.actionButton}>
            <Feather name="copy" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Copiar</Text>
          </TouchableOpacity>
          {Platform.OS !== 'web' && (
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Feather name="share-2" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Compartilhar</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.profiles.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card elevation="level1" style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Avatar name={item.profiles.name} url={item.profiles.avatar_url} size="md" />
                <View style={styles.memberText}>
                  <Text style={styles.memberName}>{item.profiles.name}</Text>
                  <Text style={styles.memberRole}>{item.role === 'admin' ? 'Administrador' : 'Membro'}</Text>
                </View>
                
                <View style={{ flex: 1 }} />
                
                {isAdmin && item.profiles.id !== user?.id && (
                  <View style={styles.actions}>
                    {item.role !== 'admin' && (
                      <Text style={styles.actionText} onPress={() => handlePromoteMember(item.profiles.id, item.profiles.name)}>Promover</Text>
                    )}
                    <Text style={[styles.actionText, styles.actionDanger]} onPress={() => handleRemoveMember(item.profiles.id, item.profiles.name)}>Remover</Text>
                  </View>
                )}
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.lg },
  inviteCard: { padding: theme.spacing.xl, marginBottom: theme.spacing.xl, backgroundColor: theme.colors.primary + '10' },
  inviteTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.sm },
  inviteText: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  codeBox: { backgroundColor: theme.colors.background, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  codeText: { fontSize: theme.typography.sizes.bodyLg, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: theme.colors.textPrimary, textAlign: 'center', fontWeight: 'bold' },
  list: { paddingBottom: theme.spacing.xl },
  memberCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  memberText: { marginLeft: theme.spacing.md },
  memberName: { fontSize: theme.typography.sizes.titleSm, fontWeight: '600', color: theme.colors.textPrimary },
  memberRole: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.textSecondary, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: theme.spacing.md },
  actionText: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.primary, fontWeight: '600' },
  actionDanger: { color: theme.colors.error },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14
  }
});
