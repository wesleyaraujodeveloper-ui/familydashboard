import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Slot, Link, useRouter, usePathname } from 'expo-router';
import { Modal, TouchableOpacity, Pressable, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useGroup } from '../../src/store/group';
import { useSpace } from '../../src/store/space';
import { supabase } from '../../src/services/supabase';
import { Avatar } from '../../src/components/ui/Avatar';

export default function MainLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Desktop Breakpoint
  const { activeGroup, groups, setActiveGroup } = useGroup();
  const { spaces, activeSpace, setActiveSpace, setSpaces } = useSpace();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showGroupSwitcher, setShowGroupSwitcher] = React.useState(false);
  const [groupMembers, setGroupMembers] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (activeGroup) {
      supabase
        .from('group_members')
        .select('profiles(id, name, avatar_url), role')
        .eq('group_id', activeGroup.id)
        .then(({ data }) => {
          if (data) {
            setGroupMembers(data.map(m => ({ ...m.profiles, role: m.role })));
          }
        });
    }
  }, [activeGroup]);

  const switchGroup = async (group: any) => {
    setActiveGroup(group);
    setShowGroupSwitcher(false);
    setMobileMenuOpen(false);
    const { data: spacesData } = await supabase.from('spaces').select('*').eq('group_id', group.id).order('created_at', { ascending: true });
    if (spacesData && spacesData.length > 0) {
      setSpaces(spacesData);
      setActiveSpace(spacesData[0]);
    } else {
      setSpaces([]);
      setActiveSpace(null as any);
    }
    router.push('/(main)/mural' as any);
  };

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {/* SIDEBAR DESKTOP */}
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={() => setShowGroupSwitcher(!showGroupSwitcher)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={styles.logo}>{activeGroup?.name || 'Mural'}</Text>
            <Feather name={showGroupSwitcher ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          
          {showGroupSwitcher && (
            <View style={{ marginBottom: 16, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 8 }}>
              {groups.map(g => (
                <TouchableOpacity key={g.id} onPress={() => switchGroup(g)} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.colors.border }}>
                  <Text style={{ fontWeight: g.id === activeGroup?.id ? 'bold' : 'normal', color: g.id === activeGroup?.id ? theme.colors.primary : theme.colors.textSecondary }}>{g.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => { setShowGroupSwitcher(false); router.push('/(onboarding)/create-group' as any); }} style={{ paddingVertical: 8 }}>
                <Text style={{ color: theme.colors.primary }}>+ Criar novo grupo</Text>
              </TouchableOpacity>
            </View>
          )}

          <Link href={"/(main)" as any} style={styles.navLink}>Início</Link>
          <Link href={"/(main)/meu-dia" as any} style={styles.navLink}>Meu Dia</Link>
          <Link href={"/(main)/calendario" as any} style={styles.navLink}>Calendário</Link>

          <View style={styles.spaceSection}>
            <Text style={styles.sectionTitle}>Espaços</Text>
            {spaces.map(space => (
              <Text 
                key={space.id} 
                style={[styles.spaceLink, activeSpace?.id === space.id && pathname === '/mural' ? styles.spaceLinkActive : null]}
                onPress={() => {
                  setActiveSpace(space);
                  router.push('/(main)/mural' as any);
                }}
              >
                # {space.name}
              </Text>
            ))}
            <Link href={"/(main)/criar-espaco" as any} style={styles.createSpaceLink}>+ Novo Espaço</Link>
            <Link href={"/(main)/gerenciar-espacos" as any} style={styles.manageSpaceLink}>⚙️ Gerenciar Espaços</Link>
          </View>
          
          <View style={{ flex: 1 }} />
          
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Membros</Text>
            {groupMembers.map(m => (
              <View key={m.id} style={styles.sidebarMemberItem}>
                <Avatar name={m.name} url={m.avatar_url} size="sm" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.sidebarMemberName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                  <Text style={styles.sidebarMemberRole}>{m.role === 'admin' ? 'Admin' : 'Membro'}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push('/(main)/membros' as any)} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="user-plus" size={14} color={theme.colors.primary} />
              <Text style={[styles.navLink, { paddingVertical: 4, marginLeft: 8, fontSize: 13, color: theme.colors.primary }]}>Convidar</Text>
            </TouchableOpacity>
          </View>
          
          <Link href={"/(main)/notificacoes" as any} style={styles.navLink}>Notificações</Link>
          <Link href={"/(main)/historico" as any} style={styles.navLink}>Histórico</Link>
          <Link href={"/(main)/membros" as any} style={styles.navLink}>Membros</Link>
          <Link href={"/(main)/configuracoes" as any} style={styles.navLink}>Configurações</Link>
          
          <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {/* ÁREA PRINCIPAL */}
        <View style={styles.mainArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{activeGroup?.name || 'Família'}</Text>
          </View>
          <View style={styles.content}>
            <Slot />
          </View>
        </View>
      </View>
    );
  }

  // APP SHELL MOBILE (Bottom Tabs customizadas para manter o layout no Slot)
  return (
    <View style={styles.mobileContainer}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setMobileMenuOpen(true)} style={{ marginRight: 16 }}>
            <Feather name="menu" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{activeGroup?.name || 'Família'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(main)/notificacoes' as any)} style={{ padding: 8 }}>
          <Feather name="bell" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* MOBILE DRAWER */}
      <Modal visible={mobileMenuOpen} transparent animationType="fade">
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Menu Drawer */}
          <View style={{ width: 280, backgroundColor: theme.colors.surface, height: '100%', padding: theme.spacing.lg, paddingTop: 60, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 }}>
            
            <TouchableOpacity onPress={() => setShowGroupSwitcher(!showGroupSwitcher)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={styles.logo}>{activeGroup?.name || 'Mural'}</Text>
              <Feather name={showGroupSwitcher ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.primary} />
            </TouchableOpacity>

            {showGroupSwitcher && (
              <View style={{ marginBottom: 16, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 8 }}>
                {groups.map(g => (
                  <TouchableOpacity key={g.id} onPress={() => switchGroup(g)} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ fontWeight: g.id === activeGroup?.id ? 'bold' : 'normal', color: g.id === activeGroup?.id ? theme.colors.primary : theme.colors.textSecondary }}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => { setShowGroupSwitcher(false); setMobileMenuOpen(false); router.push('/(onboarding)/create-group' as any); }} style={{ paddingVertical: 8 }}>
                  <Text style={{ color: theme.colors.primary }}>+ Criar novo grupo</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.spaceSection, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Espaços</Text>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {spaces.map(space => (
                  <TouchableOpacity 
                    key={space.id} 
                    onPress={() => {
                      setActiveSpace(space);
                      setMobileMenuOpen(false);
                      if (pathname !== '/mural') router.push('/(main)/mural' as any);
                    }}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.colors.border }}
                  >
                    <Text style={[
                      { fontSize: 16, color: theme.colors.textSecondary },
                      activeSpace?.id === space.id && { color: theme.colors.primary, fontWeight: 'bold' }
                    ]}>
                      # {space.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/criar-espaco' as any); }}>
                  <Text style={{ fontSize: 16, color: theme.colors.primary, marginTop: 16, fontWeight: 'bold', paddingVertical: 12 }}>+ Novo Espaço</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/gerenciar-espacos' as any); }}>
                  <Text style={{ fontSize: 16, color: theme.colors.textSecondary, fontWeight: 'bold', paddingVertical: 12 }}>⚙️ Gerenciar Espaços</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>Membros</Text>
              <ScrollView style={{ maxHeight: 120 }}>
                {groupMembers.map(m => (
                  <View key={m.id} style={styles.sidebarMemberItem}>
                    <Avatar name={m.name} url={m.avatar_url} size="sm" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.sidebarMemberName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                      <Text style={styles.sidebarMemberRole}>{m.role === 'admin' ? 'Admin' : 'Membro'}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/membros' as any); }} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="user-plus" size={14} color={theme.colors.primary} />
                <Text style={{ fontSize: 14, color: theme.colors.primary, marginLeft: 8, fontWeight: 'bold' }}>Convidar Membro</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingTop: 16, borderTopWidth: 1, borderColor: theme.colors.border, marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/historico' as any); }}>
                 <Text style={styles.navLink}>Histórico</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/membros' as any); }}>
                 <Text style={styles.navLink}>Membros</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/configuracoes' as any); }}>
                 <Text style={styles.navLink}>Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Overlay to close */}
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setMobileMenuOpen(false)} />
        </View>
      </Modal>

      <View style={styles.content}>
        <Slot />
      </View>

      {/* BOTTOM TABS MOBILE */}
      <View style={styles.bottomTabs}>
        <Link href={"/(main)" as any} style={styles.tabItem}>Início</Link>
        <Link href={"/(main)/meu-dia" as any} style={styles.tabItem}>Meu Dia</Link>
        <Link href={"/(main)/mural" as any} style={styles.tabItem}>Mural</Link>
        <Link href={"/(main)/calendario" as any} style={styles.tabItem}>Agenda</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop
  desktopContainer: { flex: 1, flexDirection: 'row', backgroundColor: theme.colors.background },
  sidebar: { width: 250, backgroundColor: theme.colors.surface, borderRightWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg },
  logo: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.xxl },
  navLink: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textPrimary, marginBottom: theme.spacing.md, fontWeight: '500' },
  
  spaceSection: { marginTop: theme.spacing.xl },
  sectionTitle: { fontSize: theme.typography.sizes.labelMd, textTransform: 'uppercase', color: theme.colors.textMuted, fontWeight: 'bold', marginBottom: theme.spacing.sm },
  membersSection: {
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md
  },
  sidebarMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  sidebarMemberName: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500'
  },
  sidebarMemberRole: {
    fontSize: 11,
    color: theme.colors.textMuted
  },
  spaceLink: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, paddingVertical: 4 },
  spaceLinkActive: { color: theme.colors.primary, fontWeight: 'bold' },
  createSpaceLink: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.primary, marginTop: theme.spacing.sm, fontWeight: '600' },
  manageSpaceLink: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, fontWeight: '600' },

  // Mobile
  mobileContainer: { flex: 1, backgroundColor: theme.colors.background },
  bottomTabs: { height: 70, flexDirection: 'row', backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'space-around', paddingBottom: 10 },
  tabItem: { fontSize: theme.typography.sizes.bodySm, color: theme.colors.textSecondary, fontWeight: '500', padding: 8 },
  
  // Shared
  mainArea: { flex: 1 },
  header: { height: 60, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', paddingHorizontal: theme.spacing.lg },
  headerTitle: { fontSize: theme.typography.sizes.titleMd, fontWeight: '600', color: theme.colors.textPrimary },
  content: { flex: 1 },
});
