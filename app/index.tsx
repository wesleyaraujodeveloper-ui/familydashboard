import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { theme } from '../src/theme';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Input } from '../src/components/ui/Input';
import { Avatar } from '../src/components/ui/Avatar';

export default function DesignSystemPreview() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🎨 Mural - Design System (Etapa 2)</Text>
      
      <Card style={styles.section} elevation="level1">
        <Text style={styles.sectionTitle}>Botões (Buttons)</Text>
        <View style={styles.row}>
          <Button title="Salvar Tarefa" />
          <View style={{width: 8}}/>
          <Button title="Cancelar" variant="secondary" />
        </View>
        <View style={{marginTop: 8}}>
          <Button title="Carregando..." isLoading />
        </View>
      </Card>

      <Card style={styles.section} elevation="level2">
        <Text style={styles.sectionTitle}>Campos de Texto (Inputs)</Text>
        <Input label="Nome da Tarefa" placeholder="Ex: Comprar materiais da escola" />
        <Input label="Participante" error="Este campo é obrigatório para salvar." placeholder="Digite o nome..." />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Membros (Avatares)</Text>
        <View style={styles.row}>
          <Avatar initials="EL" />
          <View style={{width: 8}}/>
          <Avatar initials="FM" />
          <View style={{width: 8}}/>
          <Avatar initials="MA" size={48} />
        </View>
      </Card>
      
      <Text style={{color: theme.colors.textMuted, textAlign: 'center', marginTop: 20}}>
        Os demais componentes (Modais, Toasts, Badges) serão incluídos conforme montamos as rotas.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, maxWidth: 800, marginHorizontal: 'auto', width: '100%' },
  title: { fontSize: theme.typography.sizes.headlineLg, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.xl },
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: theme.typography.sizes.headlineSm, fontWeight: '600', marginBottom: theme.spacing.md, color: theme.colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center' }
});
