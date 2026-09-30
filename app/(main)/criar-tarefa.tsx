import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';
import { useSpace } from '../../src/store/space';
import { useAuth } from '../../src/store/auth';
import { useGroup } from '../../src/store/group';
import { logActivity } from '../../src/services/activity';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Image, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';

export default function CriarTarefaScreen() {
  const router = useRouter();
  const { activeSpace } = useSpace();
  const { activeGroup } = useGroup();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [date, setDate] = useState(''); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleDateChange = (text: string) => {
    let raw = text.replace(/\D/g, ''); 
    if (raw.length > 8) raw = raw.slice(0, 8); 
    let formatted = raw;
    if (raw.length > 4) formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    else if (raw.length > 2) formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    setDate(formatted);
  };

  const handleCreate = async () => {
    if (!title.trim() || !activeSpace || !user) {
      alert('O título da tarefa é obrigatório.');
      return;
    }

    let due_date = null;
    if (date.trim()) {
      try {
        const parts = date.split('/');
        if (parts.length === 3) {
          due_date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`).toISOString();
        }
      } catch (e) {}
    }

    setLoading(true);

    let imageUrl = null;
    if (imageBase64) {
      try {
        // Na web o URI costuma ser um "blob:" ou "data:", não tendo extensão de arquivo clara.
        // Vamos forçar .jpg para garantir um Content-Type válido (image/jpeg) no Supabase, que evita o erro 400.
        const ext = 'jpg';
        const contentType = 'image/jpeg';
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const filePath = `${activeSpace.id}/${fileName}`;
        
        // Remove o prefixo data:image/...;base64, que a web injeta
        const cleanBase64 = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
        
        const { error: uploadError } = await supabase.storage
          .from('family_media')
          .upload(filePath, decode(cleanBase64), { contentType, upsert: true });
          
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('family_media').getPublicUrl(filePath);
          imageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.log('Upload error', err);
      }
    }

    const { error } = await supabase.from('tasks').insert([{
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date,
      image_url: imageUrl,
      space_id: activeSpace.id,
      status: 'todo',
      created_by: user.id
    }]);
    setLoading(false);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      if (activeGroup) {
        logActivity(activeGroup.id, user.id, 'task', title.trim(), 'created');
      }
      if (router.canGoBack()) router.back();
      else router.replace('/(main)/mural' as any);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nova Tarefa</Text>
      <Text style={styles.subtitle}>Espaço: {activeSpace?.name}</Text>

      <Card elevation="level1" style={styles.card}>
        <Input 
          label="Título" 
          placeholder="Ex: Pagar conta de luz" 
          value={title} 
          onChangeText={setTitle} 
        />
        
        <View style={{ marginTop: theme.spacing.md }}>
          <Input 
            label="Descrição" 
            placeholder="Detalhes adicionais da tarefa..." 
            value={description} 
            onChangeText={setDescription} 
            multiline 
          />
        </View>

        <View style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Input 
                label="Data de Previsão (Opcional)" 
                placeholder="DD/MM/AAAA" 
                value={date} 
                onChangeText={handleDateChange} 
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={{ marginLeft: 10, marginTop: 20, padding: 12, backgroundColor: '#e4e6ea', borderRadius: 8 }}>
              <Feather name="calendar" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.row}>
          <Button 
            title="Baixa" 
            variant={priority === 'low' ? 'primary' : 'secondary'} 
            onPress={() => setPriority('low')} 
            style={{ flex: 1, marginRight: 8 }} 
          />
          <Button 
            title="Média" 
            variant={priority === 'medium' ? 'primary' : 'secondary'} 
            onPress={() => setPriority('medium')} 
            style={{ flex: 1, marginRight: 8 }} 
          />
          <Button 
            title="Alta" 
            variant={priority === 'high' ? 'primary' : 'secondary'} 
            onPress={() => setPriority('high')} 
            style={{ flex: 1 }} 
          />
        </View>

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button 
            title={imageUri ? "Trocar Imagem" : "🖼️ Anexar Imagem"} 
            variant="secondary" 
            onPress={pickImage} 
          />
          {imageUri && (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 10 }} resizeMode="cover" />
          )}
        </View>

        <Button 
          title="Criar Tarefa"  
          onPress={handleCreate} 
          isLoading={loading} 
          style={{ marginTop: theme.spacing.xl }} 
        />
        <Button 
          title="Cancelar" 
          variant="ghost" 
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(main)/mural' as any);
          }} 
          style={{ marginTop: theme.spacing.sm }} 
        />
      </Card>

      <Modal visible={showCalendar} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 10, overflow: 'hidden' }}>
            <Calendar
              onDayPress={(day: any) => {
                const parts = day.dateString.split('-');
                setDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
                setShowCalendar(false);
              }}
              theme={{
                todayTextColor: theme.colors.primary,
                arrowColor: theme.colors.primary,
              }}
            />
            <Button title="Cancelar" variant="ghost" onPress={() => setShowCalendar(false)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, maxWidth: 600, width: '100%', marginHorizontal: 'auto' },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.textPrimary },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  card: { padding: theme.spacing.xl },
  label: { fontSize: theme.typography.sizes.labelMd, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between' }
});
