import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { storage } from '../lib/storage';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLocalUser: boolean;
  onboardingDone: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInLocal: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const LOCAL_USER_KEY = '@cookcan/local_user';

async function setLocalUser(email: string) {
  const normalized = email.trim() || 'cook@cookcan.app';
  await AsyncStorage.setItem(LOCAL_USER_KEY, normalized);
  return { id: 'local', email: normalized } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalUser, setIsLocalUser] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    (async () => {
      const done = await storage.getOnboardingDone();
      if (mounted) setOnboardingDone(done);

      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
          setSession(next);
          setUser(next?.user ?? null);
          setIsLocalUser(false);
        });
        unsubscribe = () => sub.subscription.unsubscribe();
        setLoading(false);
        return;
      }

      const local = await AsyncStorage.getItem(LOCAL_USER_KEY);
      if (local && mounted) {
        setIsLocalUser(true);
        setUser({ id: 'local', email: local } as User);
      }
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const signInLocal = useCallback(async (email: string) => {
    const localUser = await setLocalUser(email);
    setIsLocalUser(true);
    setUser(localUser);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured) {
        await signInLocal(email);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [signInLocal]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured) {
        await signInLocal(email);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    [signInLocal]
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(LOCAL_USER_KEY);
    setIsLocalUser(false);
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    await storage.setOnboardingDone();
    setOnboardingDone(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isLocalUser,
      onboardingDone,
      signIn,
      signUp,
      signInLocal,
      signOut,
      completeOnboarding,
    }),
    [
      user,
      session,
      loading,
      isLocalUser,
      onboardingDone,
      signIn,
      signUp,
      signInLocal,
      signOut,
      completeOnboarding,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
