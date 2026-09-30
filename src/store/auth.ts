import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,
  
  setSession: (session) => 
    set({ session, user: session?.user ?? null, isInitialized: true }),
    
  initialize: () => {
    // Busca a sessão inicial caso o usuário já tenha logado antes
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isInitialized: true });
    });

    // Escuta mudanças (ex: quando o usuário faz login, logout ou a sessão expira)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isInitialized: true });
    });
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  }
}));
