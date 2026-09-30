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

const SidebarLink = ({ href, icon, label, isActive, onPress }: any) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.navItem, isActive && styles.navItemActive]}>
        <Feather name={icon as any} size={20} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
        <Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={[styles.navItem, isActive && styles.navItemActive]}>
        <Feather name={icon as any} size={20} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
        <Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text>
      </TouchableOpacity>
    </Link>
  );
};

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
          <TouchableOpacity onPress={() => setShowGroupSwitcher(!showGroupSwitcher)} style={styles.groupSwitcherBtn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.groupIcon}><Feather name="users" size={16} color="#fff" /></View>
              <Text style={styles.logo}>{activeGroup?.name || 'Mural'}</Text>
            </View>
            <Feather name={showGroupSwitcher ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 12 }}>
          
          {showGroupSwitcher && (
            <View style={styles.groupDropdown}>
              {groups.map(g => (
                <TouchableOpacity key={g.id} onPress={() => switchGroup(g)} style={styles.groupOption}>
                  <Text style={{ fontWeight: g.id === activeGroup?.id ? 'bold' : 'normal', color: g.id === activeGroup?.id ? theme.colors.primary : theme.colors.textSecondary }}>{g.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => { setShowGroupSwitcher(false); router.push('/(onboarding)/create-group' as any); }} style={styles.groupOption}>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>+ Entrar ou Criar Grupo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mainNav}>
            <SidebarLink href="/(main)" icon="home" label="Início" isActive={pathname === '/'} />
            <SidebarLink href="/(main)/meu-dia" icon="sun" label="Meu Dia" isActive={pathname === '/meu-dia'} />
            <SidebarLink href="/(main)/calendario" icon="calendar" label="Calendário" isActive={pathname === '/calendario'} />
          </View>

          <View style={styles.spaceSection}>
            <Text style={styles.sectionTitle}>ESPAÇOS</Text>
            {spaces.map(space => (
              <TouchableOpacity 
                key={space.id} 
                style={[styles.spaceLink, activeSpace?.id === space.id && pathname === '/mural' ? styles.spaceLinkActive : null]}
                onPress={() => {
                  setActiveSpace(space);
                  router.push('/(main)/mural' as any);
                }}
              >
                <Feather name="hash" size={16} color={activeSpace?.id === space.id && pathname === '/mural' ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.spaceLinkText, activeSpace?.id === space.id && pathname === '/mural' ? styles.spaceLinkTextActive : null]}>
                  {space.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => router.push('/(main)/criar-espaco' as any)} style={styles.sidebarActionBtn}>
              <Feather name="plus-circle" size={14} color={theme.colors.primary} />
              <Text style={styles.sidebarActionText}>Novo Espaço</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(main)/gerenciar-espacos' as any)} style={styles.sidebarActionBtn}>
              <Feather name="settings" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.sidebarActionText, { color: theme.colors.textSecondary }]}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1, minHeight: 40 }} />
          
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>MEMBROS</Text>
            {groupMembers.map(m => (
              <View key={m.id} style={styles.sidebarMemberItem}>
                <Avatar name={m.name} url={m.avatar_url} size="sm" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.sidebarMemberName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                  <Text style={styles.sidebarMemberRole}>{m.role === 'admin' ? 'Admin' : 'Membro'}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push('/(main)/membros' as any)} style={[styles.sidebarActionBtn, { marginTop: 12 }]}>
              <Feather name="user-plus" size={14} color={theme.colors.primary} />
              <Text style={styles.sidebarActionText}>Convidar Membro</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerLinks}>
            <SidebarLink href="/(main)/notificacoes" icon="bell" label="Notificações" isActive={pathname === '/notificacoes'} />
            <SidebarLink href="/(main)/historico" icon="clock" label="Histórico" isActive={pathname === '/historico'} />
            <SidebarLink href="/(main)/membros" icon="users" label="Membros" isActive={pathname === '/membros'} />
            <SidebarLink href="/(main)/configuracoes" icon="settings" label="Configurações" isActive={pathname === '/configuracoes'} />
          </View>
          
          <View style={{ height: 20 }} />
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
          <View style={{ width: 300, backgroundColor: theme.colors.surface, height: '100%', padding: theme.spacing.lg, paddingTop: 60, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 }}>
            
            <TouchableOpacity onPress={() => setShowGroupSwitcher(!showGroupSwitcher)} style={styles.groupSwitcherBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.groupIcon}><Feather name="users" size={16} color="#fff" /></View>
                <Text style={styles.logo}>{activeGroup?.name || 'Mural'}</Text>
              </View>
              <Feather name={showGroupSwitcher ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 12 }}>
            {showGroupSwitcher && (
              <View style={styles.groupDropdown}>
                {groups.map(g => (
                  <TouchableOpacity key={g.id} onPress={() => switchGroup(g)} style={styles.groupOption}>
                    <Text style={{ fontWeight: g.id === activeGroup?.id ? 'bold' : 'normal', color: g.id === activeGroup?.id ? theme.colors.primary : theme.colors.textSecondary }}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => { setShowGroupSwitcher(false); setMobileMenuOpen(false); router.push('/(onboarding)/create-group' as any); }} style={styles.groupOption}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>+ Entrar ou Criar Grupo</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.mainNav}>
              <SidebarLink onPress={() => { setMobileMenuOpen(false); router.push('/(main)' as any); }} icon="home" label="Início" isActive={pathname === '/'} />
              <SidebarLink onPress={() => { setMobileMenuOpen(false); router.push('/(main)/meu-dia' as any); }} icon="sun" label="Meu Dia" isActive={pathname === '/meu-dia'} />
              <SidebarLink onPress={() => { setMobileMenuOpen(false); router.push('/(main)/calendario' as any); }} icon="calendar" label="Calendário" isActive={pathname === '/calendario'} />
            </View>

            <View style={styles.spaceSection}>
              <Text style={styles.sectionTitle}>ESPAÇOS</Text>
              {spaces.map(space => (
                <TouchableOpacity 
                  key={space.id} 
                  style={[styles.spaceLink, activeSpace?.id === space.id && pathname === '/mural' ? styles.spaceLinkActive : null]}
                  onPress={() => {
                    setActiveSpace(space);
                    setMobileMenuOpen(false);
                    if (pathname !== '/mural') router.push('/(main)/mural' as any);
                  }}
                >
                  <Feather name="hash" size={16} color={activeSpace?.id === space.id && pathname === '/mural' ? theme.colors.primary : theme.colors.textMuted} />
                  <Text style={[styles.spaceLinkText, activeSpace?.id === space.id && pathname === '/mural' ? styles.spaceLinkTextActive : null]}>
                    {space.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/criar-espaco' as any); }} style={styles.sidebarActionBtn}>
                <Feather name="plus-circle" size={14} color={theme.colors.primary} />
                <Text style={styles.sidebarActionText}>Novo Espaço</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/gerenciar-espacos' as any); }} style={styles.sidebarActionBtn}>
                <Feather name="settings" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.sidebarActionText, { color: theme.colors.textSecondary }]}>Gerenciar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>MEMBROS</Text>
              {groupMembers.map(m => (
                <View key={m.id} style={styles.sidebarMemberItem}>
                  <Avatar name={m.name} url={m.avatar_url} size="sm" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.sidebarMemberName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                    <Text style={styles.sidebarMemberRole}>{m.role === 'admin' ? 'Admin' : 'Membro'}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={() => { setMobileMenuOpen(false); router.push('/(main)/membros' as any); }} style={[styles.sidebarActionBtn, { marginTop: 12 }]}>
                <Feather name="user-plus" size={14} color={theme.colors.primary} />
                <Text style={styles.sidebarActionText}>Convidar Membro</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerLinks}>
              <SidebarLink onPress={() => { setMobileMenuOpen(false); router.push('/(main)/historico' as any); }} icon="clock" label="Histórico" isActive={pathname === '/historico'} />
              <SidebarLink onPress={() => { setMobileMenuOpen(false); router.push('/(main)/configuracoes' as any); }} icon="settings" label="Configurações" isActive={pathname === '/configuracoes'} />
            </View>
            
            <View style={{ height: 40 }} />
            </ScrollView>
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
        <Link href={"/(main)" as any} asChild>
          <TouchableOpacity style={styles.tabItemContainer}>
            <Feather name="home" size={24} color={pathname === '/' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabItem, pathname === '/' && { color: theme.colors.primary }]}>Início</Text>
          </TouchableOpacity>
        </Link>
        <Link href={"/(main)/meu-dia" as any} asChild>
          <TouchableOpacity style={styles.tabItemContainer}>
            <Feather name="sun" size={24} color={pathname === '/meu-dia' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabItem, pathname === '/meu-dia' && { color: theme.colors.primary }]}>Meu Dia</Text>
          </TouchableOpacity>
        </Link>
        <Link href={"/(main)/mural" as any} asChild>
          <TouchableOpacity style={styles.tabItemContainer}>
            <Feather name="trello" size={24} color={pathname === '/mural' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabItem, pathname === '/mural' && { color: theme.colors.primary }]}>Mural</Text>
          </TouchableOpacity>
        </Link>
        <Link href={"/(main)/calendario" as any} asChild>
          <TouchableOpacity style={styles.tabItemContainer}>
            <Feather name="calendar" size={24} color={pathname === '/calendario' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabItem, pathname === '/calendario' && { color: theme.colors.primary }]}>Agenda</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop
  desktopContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#F1F5F9' },
  sidebar: { 
    width: 260, 
    backgroundColor: '#ffffff', 
    borderRightWidth: 1, 
    borderColor: '#E2E8F0', 
    padding: theme.spacing.lg 
  },
  
  groupSwitcherBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8
  },
  groupIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center'
  },
  logo: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  
  groupDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupOption: {
    padding: 12,
    borderRadius: 10
  },
  
  mainNav: {
    marginBottom: 24,
    gap: 4
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12
  },
  navItemActive: {
    backgroundColor: '#FFF1F2',
  },
  navText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B'
  },
  navTextActive: {
    color: theme.colors.primary,
    fontWeight: '800'
  },
  
  spaceSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, color: '#94A3B8', fontWeight: '800', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 12 },
  
  spaceLink: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    marginBottom: 2
  },
  spaceLinkActive: { 
    backgroundColor: '#F1F5F9'
  },
  spaceLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B'
  },
  spaceLinkTextActive: {
    color: '#0F172A',
    fontWeight: '800'
  },
  
  sidebarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
  },
  sidebarActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary
  },

  membersSection: {
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#F1F5F9'
  },
  sidebarMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sidebarMemberName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700'
  },
  sidebarMemberRole: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500'
  },
  
  footerLinks: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    gap: 4
  },

  // Mobile
  mobileContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  bottomTabs: { height: 75, flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 16, paddingTop: 8 },
  tabItemContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4 },
  tabItem: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  
  // Shared
  mainArea: { flex: 1 },
  header: { height: 70, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', paddingHorizontal: theme.spacing.lg },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { flex: 1 },
});
