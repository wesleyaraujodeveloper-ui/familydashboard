import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { supabase } from '../../src/services/supabase';
import { useAuth } from '../../src/store/auth';
import { Card } from '../../src/components/ui/Card';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificacoesScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    };
    
    fetchNotifications();

    if (!user) return;

    const channel = supabase
      .channel('custom-all-channel-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string, link: string | null) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);

    if (link) {
      router.push(link as any);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('profile_id', user.id).eq('is_read', false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.subtitle}>Você tem {unreadCount} nova(s) notificação(ões)</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      <Card elevation="level1" style={styles.card}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Você não tem notificações.</Text>
        ) : (
          notifications.map(notif => (
            <TouchableOpacity 
              key={notif.id} 
              style={[styles.notifRow, !notif.is_read && styles.notifUnread]}
              onPress={() => markAsRead(notif.id, notif.link)}
            >
              <View style={styles.iconCircle}>
                <Feather name="bell" size={20} color={!notif.is_read ? theme.colors.primary : theme.colors.textMuted} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.notifTitle, !notif.is_read && styles.notifTitleUnread]}>{notif.title}</Text>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.time}>{new Date(notif.created_at).toLocaleString('pt-BR')}</Text>
              </View>
              {!notif.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, width: '100%', marginHorizontal: 'auto' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: theme.spacing.xl },
  title: { fontSize: theme.typography.sizes.headlineMd, fontWeight: 'bold', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  markAllText: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.primary, fontWeight: 'bold' },
  
  card: { padding: theme.spacing.sm },
  emptyText: { color: theme.colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginVertical: theme.spacing.xl },
  
  notifRow: { flexDirection: 'row', padding: theme.spacing.md, borderBottomWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  notifUnread: { backgroundColor: '#f0f7ff' },
  
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  
  content: { flex: 1 },
  notifTitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary },
  notifTitleUnread: { fontWeight: 'bold', color: theme.colors.textPrimary },
  notifMessage: { fontSize: theme.typography.sizes.bodyMd, color: theme.colors.textSecondary, marginTop: 4 },
  time: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginLeft: 8 }
});
