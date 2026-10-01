import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';
import { supabase } from '../services/supabase';
import { useAuth } from '../store/auth';
import { logActivity } from '../services/activity';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Feather } from '@expo/vector-icons';

interface CommentsProps {
  entityType: 'tasks' | 'ideas' | 'notices' | 'events' | 'lists';
  entityId: string;
  spaceId: string;
  groupId: string;
  entityTitle: string;
}

export function Comments({ entityType, entityId, spaceId, groupId, entityTitle }: CommentsProps) {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(name, avatar_url)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [entityId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    
    const text = newComment.trim();
    setNewComment('');

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        space_id: spaceId,
        entity_type: entityType,
        entity_id: entityId,
        profile_id: user.id,
        text
      }])
      .select('*, profiles(name, avatar_url)')
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data]);
      // Log Activity
      logActivity(groupId, user.id, entityType.slice(0, -1), entityTitle, 'commented');
    }
  };

  const handleDeleteComment = async (id: string) => {
    Alert.alert('Excluir Comentário', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => {
        await supabase.from('comments').delete().eq('id', id);
        setComments(prev => prev.filter(c => c.id !== id));
      }}
    ]);
  };

  return (
    <Card elevation="level1" style={styles.container}>
      <Text style={styles.title}>Comentários ({comments.length})</Text>
      
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : comments.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum comentário ainda. Comece a discussão!</Text>
      ) : (
        <View style={styles.list}>
          {comments.map(c => (
            <View key={c.id} style={styles.commentItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{c.profiles?.name?.charAt(0) || 'U'}</Text>
              </View>
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.author}>{c.profiles?.name || 'Usuário'}</Text>
                  <Text style={styles.time}>{new Date(c.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.text}>{c.text}</Text>
              </View>
              {c.profile_id === user?.id && (
                <TouchableOpacity onPress={() => handleDeleteComment(c.id)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={14} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Input 
            placeholder="Escreva um comentário..." 
            value={newComment} 
            onChangeText={setNewComment} 
          />
        </View>
        <Button title="Enviar" onPress={handleAddComment} />
      </View>
    </Card>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  title: { fontSize: theme.typography.sizes.titleMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  loadingText: { color: theme.colors.textMuted },
  emptyText: { color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: theme.spacing.md },
  list: { marginBottom: theme.spacing.md },
  commentItem: { flexDirection: 'row', marginBottom: theme.spacing.md },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarInitial: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  content: { flex: 1, backgroundColor: '#f0f2f5', padding: 12, borderRadius: 12, borderTopLeftRadius: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  author: { fontWeight: 'bold', color: theme.colors.textPrimary, fontSize: 14 },
  time: { color: theme.colors.textMuted, fontSize: 12 },
  text: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 },
  deleteBtn: { padding: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' }
});
