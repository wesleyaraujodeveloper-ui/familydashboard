import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/services/supabase';
import { useSpace } from '../../src/store/space';
import { useAuth } from '../../src/store/auth';

export default function CriarRecadoScreen() {
  const router = useRouter();
  const { activeSpace } = useSpace();
  const { user } = useAuth();

  const [text, setText] = useState('');
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
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
    console.log('Clicou em salvar:', { text, space_id: activeSpace?.id, user_id: user?.id });
    if (!text.trim() || !activeSpace || !user) {
      alert('O texto do recado é obrigatório.');
      return;
    }

    let due_date = null;
    if (date.trim()) {
      try {
        const parts = date.split('/');
        if (parts.length === 3) due_date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`).toISOString();
      } catch (e) {}
    }

    setLoading(true);

    let finalImageUrl = null;
    if (imageBase64) {
      const fileName = `media_${Date.now()}.png`;
      let cleanedBase64 = imageBase64;
      if (cleanedBase64.includes('base64,')) {
        cleanedBase64 = cleanedBase64.split('base64,')[1];
      }
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('family_media')
        .upload(fileName, decode(cleanedBase64), { contentType: 'image/jpeg', upsert: true });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('family_media').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const { data, error } = await supabase.from('notices').insert([{
      text: text.trim(),
      space_id: activeSpace.id,
      due_date,
      image_url: finalImageUrl,
      status: 'todo',
      created_by: user.id
    }]).select();
    
    console.log('Resultado DB:', { data, error });
    setLoading(false);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(main)/mural' as any);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Novo Recado</Text>
      <Text style={styles.subtitle}>Espaço: {activeSpace?.name}</Text>

      <Card elevation="level1" style={styles.card}>
        <Input 
          label="Seu Recado" 
          placeholder="Ex: Não esqueçam de trancar a porta hoje..." 
          value={text} 
          onChangeText={setText} 
          multiline 
        />

        <View style={{ marginTop: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Input 
                label="Lembrar-me no Dia (Opcional)" 
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
          title="Salvar Recado" 
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
});
