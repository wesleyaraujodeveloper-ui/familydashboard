import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../src/store/auth';
import { useGroup } from '../src/store/group';
import { useSpace } from '../src/store/space';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../src/theme';
import { supabase } from '../src/services/supabase';

export default function RootLayout() {
  const { isInitialized, session, initialize } = useAuth();
  const { setGroups, activeGroup, setActiveGroup } = useGroup();
  const { spaces, setSpaces, activeSpace, setActiveSpace } = useSpace();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    const checkState = async () => {
      if (session) {
        // Usuário logado: Verificar se ele tem um grupo
        const { data, error } = await supabase
          .from('groups')
          .select('id, name, group_members!inner(profile_id)')
          .eq('group_members.profile_id', session.user.id);

        if (!data || data.length === 0) {
          // Sem grupo -> Onboarding (mas não na welcome)
          if (!inOnboarding || segments[1] === 'welcome') {
            router.replace('/(onboarding)/create-group' as any);
          }
        } else {
          // Tem grupo -> Salva no Zustand e vai pro Mural
          if (!activeGroup || activeGroup.id !== data[0].id) {
            setGroups(data);
            setActiveGroup(data[0]);

            // Busca os espaços apenas quando carrega o grupo pela primeira vez
            const { data: spacesData } = await supabase
              .from('spaces')
              .select('*')
              .eq('group_id', data[0].id)
              .order('created_at', { ascending: true });

            if (spacesData && spacesData.length > 0) {
              setSpaces(spacesData);
              setActiveSpace(spacesData[0]);
            }
          }
          
          if (inAuthGroup || (inOnboarding && segments[1] !== 'create-group') || segments.length === 0) {
            router.replace('/(main)' as any);
          }
        }
      } else {
        // Sem sessão -> Tela de Welcome
        // Previne redirecionamento se estivermos no meio do callback OAuth do Supabase
        const isOAuthCallback = typeof window !== 'undefined' && window.location.hash.includes('access_token');
        if (!isOAuthCallback && !inAuthGroup && segments[1] !== 'welcome') {
          router.replace('/(onboarding)/welcome' as any);
        }
      }
    };

    checkState();
  }, [session, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}
