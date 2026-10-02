import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Avatar } from '../../src/components/ui/Avatar';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function GlobalHubScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const { groups, setActiveGroup } = useGroup();
  const { setActiveSpace, setSpaces } = useSpace();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleGroupSelect = async (group: any) => {
    setActiveGroup(group);
    const { data: spacesData } = await supabase.from('spaces').select('*').eq('group_id', group.id).order('created_at', { ascending: true });
    if (spacesData && spacesData.length > 0) {
      setSpaces(spacesData);
      setActiveSpace(spacesData[0]);
    } else {
      setSpaces([]);
      setActiveSpace(null as any);
    }
    router.push('/(main)/mural');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Usuário';

  const gradientColors = (theme.isDarkMode 
    ? ['#2E1534', '#151733', '#0C0F1A']
    : ['#FCE7F3', '#E0E7FF', '#E0F2FE']) as readonly [string, string, string];

  return (
    <LinearGradient colors={gradientColors} style={styles.mainContainer}>
      {/* HEADER DE BOAS VINDAS */}
      <View style={styles.topBar}>
        <View style={styles.avatarWrapper}>
          <Avatar name={profile?.name} url={profile?.avatar_url} size="md" />
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(main)/configuracoes')}>
          <Feather name="settings" size={24} color={theme.isDarkMode ? '#FFF' : '#1E1B4B'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},{'\n'}{firstName}! ✨</Text>
          <Text style={styles.subGreeting}>Vamos organizar o dia juntos.</Text>
        </View>

        {/* QUICK ACTIONS GLOBAIS */}
        <Text style={styles.sectionTitle}>Visão Geral</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(main)/meu-dia')}>
            <View style={[styles.quickActionIcon, { backgroundColor: theme.isDarkMode ? '#3A0C1E' : '#FCE7F3' }]}>
              <Feather name="sun" size={28} color={theme.isDarkMode ? '#F472B6' : '#EC4899'} />
            </View>
            <Text style={styles.quickActionLabel}>Meu Dia</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(main)/calendario')}>
            <View style={[styles.quickActionIcon, { backgroundColor: theme.isDarkMode ? '#0F172A' : '#E0E7FF' }]}>
              <Feather name="calendar" size={28} color={theme.isDarkMode ? '#818CF8' : '#4F46E5'} />
            </View>
            <Text style={styles.quickActionLabel}>Agenda Global</Text>
          </TouchableOpacity>
        </View>

        {/* GRUPOS */}
        <View style={styles.groupsHeader}>
          <Text style={styles.sectionTitle}>Meus Grupos</Text>
          <TouchableOpacity onPress={() => router.push('/(onboarding)/create-group' as any)}>
            <Feather name="plus-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Você não faz parte de nenhum grupo ainda.</Text>
          </View>
        ) : (
          <View style={styles.groupsList}>
            {groups.map(group => (
              <TouchableOpacity 
                key={group.id} 
                style={styles.groupCard}
                onPress={() => handleGroupSelect(group)}
              >
                <View style={styles.groupIconWrapper}>
                  <Feather name="users" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupSub}>Toque para entrar no mural</Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  mainContainer: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 60, // Consider SafeArea context ideally
    paddingBottom: 10,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    padding: 2,
    backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)',
    borderRadius: 99,
    borderWidth: 2,
    borderColor: theme.isDarkMode ? '#1F1235' : '#FCE7F3'
  },
  scrollArea: { flex: 1, padding: theme.spacing.xl },
  header: {
    marginTop: 10,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 38,
    fontWeight: '900',
    color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B',
    letterSpacing: -1,
    marginBottom: 8
  },
  subGreeting: {
    fontSize: 18,
    color: theme.isDarkMode ? '#A78BFA' : '#4F46E5',
    opacity: 0.9,
    lineHeight: 24,
    fontWeight: '500'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B',
    marginBottom: 16,
    marginLeft: 4
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  quickActionBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 24,
    marginHorizontal: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.isDarkMode ? '#000' : '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupsList: {
    gap: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: theme.isDarkMode ? 'rgba(236, 72, 153, 0.1)' : '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  groupSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  }
});
