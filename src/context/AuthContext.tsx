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
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { auth, isFirebaseConfigured, isAdminEmail } from '../lib/firebase';
import { ensureAdminRecord, upsertUserProfile } from '../lib/entitlements';
import { storage } from '../lib/storage';

export type AppUser = {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
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
  signInWithGoogle: () => Promise<void>;
  signInLocal: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const LOCAL_USER_KEY = '@cookcan/local_user';

function toAppUser(u: FirebaseUser): AppUser {
  return {
    id: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

async function googleNativeSignIn(): Promise<string> {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error(
      'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Firebase Google OAuth web client) to enable Google Sign-In.'
    );
  }
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken =
    (result as { data?: { idToken?: string | null } }).data?.idToken ||
    (result as { idToken?: string | null }).idToken;
  if (!idToken) throw new Error('Google Sign-In did not return an ID token.');
  return idToken;
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
    setUser({ id: 'local', email: normalized, displayName: normalized.split('@')[0] });
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

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      throw new Error('Google Sign-In works in the Android/iOS app build. Use email on web.');
    }
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Configure Firebase to use Google Sign-In, or continue with email.');
    }
    try {
      const idToken = await googleNativeSignIn();
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google Sign-In failed';
      if (/EXPO_PUBLIC_GOOGLE|native module|RNGoogleSignin|not linked/i.test(msg)) {
        throw new Error(
          'Google Sign-In needs a native build with EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Use email for now, or rebuild with EAS.'
        );
      }
      throw e instanceof Error ? e : new Error(msg);
    }
  }, []);

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
        setUser({ id: 'local', email: local, displayName: local.split('@')[0] });
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
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch {
      // optional
    }
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
      signInWithGoogle,
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
      signInWithGoogle,
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
