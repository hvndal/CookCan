import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, isFirebaseConfigured, isAdminEmail } from '../lib/firebase';
import { ensureAdminRecord, upsertUserProfile } from '../lib/entitlements';
import { storage } from '../lib/storage';

export type AppUser = {
  id: string;
  email: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isLocalUser: boolean;
  isAdmin: boolean;
  onboardingDone: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInLocal: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const LOCAL_USER_KEY = '@cookcan/local_user';

function toAppUser(u: FirebaseUser): AppUser {
  return { id: u.uid, email: u.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalUser, setIsLocalUser] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const signInLocal = useCallback(async (email: string) => {
    const normalized = email.trim() || 'cook@cookcan.app';
    await AsyncStorage.setItem(LOCAL_USER_KEY, normalized);
    setIsLocalUser(true);
    setUser({ id: 'local', email: normalized });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        await signInLocal(email);
        return;
      }
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    [signInLocal]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        await signInLocal(email);
        return;
      }
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    },
    [signInLocal]
  );

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const done = await storage.getOnboardingDone();
      setOnboardingDone(done);

      if (isFirebaseConfigured && auth) {
        unsub = onAuthStateChanged(auth, async (fbUser) => {
          setFirebaseUser(fbUser);
          if (fbUser) {
            setUser(toAppUser(fbUser));
            setIsLocalUser(false);
            if (fbUser.email) {
              await upsertUserProfile(fbUser.uid, fbUser.email);
              if (isAdminEmail(fbUser.email)) {
                await ensureAdminRecord(fbUser.uid, fbUser.email);
              }
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return;
      }

      const local = await AsyncStorage.getItem(LOCAL_USER_KEY);
      if (local) {
        setIsLocalUser(true);
        setUser({ id: 'local', email: local });
      }
      setLoading(false);
    })();

    return () => unsub?.();
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(LOCAL_USER_KEY);
    setIsLocalUser(false);
    setUser(null);
    setFirebaseUser(null);
    if (auth) await firebaseSignOut(auth);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await storage.setOnboardingDone();
    setOnboardingDone(true);
  }, []);

  const isAdmin = isAdminEmail(user?.email);

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      isLocalUser,
      isAdmin,
      onboardingDone,
      signIn,
      signUp,
      signInLocal,
      signOut,
      completeOnboarding,
    }),
    [
      user,
      firebaseUser,
      loading,
      isLocalUser,
      isAdmin,
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
