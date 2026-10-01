import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const features = [
    { icon: 'shield', color: '#059669', bg: '#d1fae5', text: 'Privacidade total do grupo' },
    { icon: 'zap', color: '#d97706', bg: '#fef3c7', text: 'Sincronização em tempo real' },
    { icon: 'sun', color: '#e06d53', bg: '#ffd3c7', text: 'Seu Dia sem sobrecarga' },
    { icon: 'users', color: '#0284c7', bg: '#e0f2fe', text: 'Para famílias, casais e times' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Simples */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={[theme.colors.primary, '#cc593e']} style={styles.logoIcon}>
              <Feather name="layout" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>Mural</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Lar & Equipe</Text>
            </View>
          </View>
        </View>

        <View style={[styles.main, isDesktop && styles.mainDesktop]}>
          
          {/* Lado Esquerdo - Textos e CTA */}
          <View style={[styles.textSection, isDesktop && { flex: 1, paddingRight: 40 }]}>
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>Espaço Privado & Colaborativo</Text>
            </View>

            <Text style={styles.title}>
              Organize a vida <Text style={{ color: theme.colors.primary }}>juntos.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Um espaço privado para reunir tarefas, recados, compromissos, listas e tudo o que importa para vocês.
            </Text>

            {/* Grid de Features */}
            <View style={styles.featuresGrid}>
              {features.map((item, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.featureIconBg, { backgroundColor: item.bg }]}>
                    <Feather name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* Botões */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/register' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Começar</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login' as any)}
              >
                <Text style={styles.secondaryButtonText}>Já tenho uma conta</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lado Direito - Ilustração Abstrata do Mural */}
          <View style={[styles.illustrationSection, isDesktop && { flex: 1 }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 211, 199, 0.4)']}
              style={styles.glassCard}
            >
              <View style={styles.glassHeader}>
                <View style={styles.glassDots}>
                  <View style={[styles.dot, { backgroundColor: '#fb7185' }]} />
                  <View style={[styles.dot, { backgroundColor: '#fbbf24' }]} />
                  <View style={[styles.dot, { backgroundColor: '#34d399' }]} />
                  <Text style={styles.glassTitle}>Mural da Casa • Família Silva</Text>
                </View>
                <View style={styles.avatarGroup}>
                  <View style={[styles.miniAvatar, { backgroundColor: '#ffd3c7', zIndex: 3 }]}><Text style={styles.miniAvatarText}>E</Text></View>
                  <View style={[styles.miniAvatar, { backgroundColor: '#bae6fd', marginLeft: -8, zIndex: 2 }]}><Text style={[styles.miniAvatarText, { color: '#0369a1' }]}>W</Text></View>
                  <View style={[styles.miniAvatar, { backgroundColor: '#fde68a', marginLeft: -8, zIndex: 1 }]}><Text style={[styles.miniAvatarText, { color: '#b45309' }]}>S</Text></View>
                </View>
              </View>

              <View style={styles.cardsRow}>
                {/* Card Tarefa */}
                <View style={[styles.demoCard, { flex: 1, marginRight: 8, marginTop: 10 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>URGENTE</Text></View>
                    <Text style={{ fontSize: 10, color: '#94a3b8' }}>17:00</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 }}>Comprar materiais escolares</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 8 }}>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>Check 2/4</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.primary, fontWeight: 'bold' }}>Elaine</Text>
                  </View>
                </View>

                {/* Card Post-it */}
                <View style={[styles.demoCard, { flex: 1, backgroundColor: '#fef3c7', borderColor: '#fde68a', transform: [{ rotate: '2deg' }], marginTop: -10 }]}>
                  <Text style={{ fontSize: 12, marginBottom: 4 }}>📌 <Text style={{ fontWeight: 'bold', color: '#92400e' }}>Recado</Text></Text>
                  <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#78350f', lineHeight: 16 }}>"Deixei a chave extra com a Vovó Luíza..."</Text>
                  <Text style={{ fontSize: 9, textAlign: 'right', marginTop: 12, color: '#b45309', fontWeight: 'bold' }}>— Wesley</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginTop: 20
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 12,
  },
  badge: {
    backgroundColor: '#fff5f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd3c7',
    marginLeft: 12
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  mainDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    width: '100%',
    marginBottom: 40
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd3c7',
    alignSelf: 'flex-start',
    marginBottom: 24
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: 8
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
    lineHeight: 56,
    marginBottom: 20
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 500
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 40,
    gap: 12
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    width: '48%',
    minWidth: 200
  },
  featureIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600'
  },
  illustrationSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  glassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
    paddingBottom: 16,
    marginBottom: 24
  },
  glassDots: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  glassTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8
  },
  avatarGroup: {
    flexDirection: 'row'
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c2410c'
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  demoBadge: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e11d48'
  }
});
