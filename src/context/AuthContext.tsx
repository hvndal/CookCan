import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type ConfirmationResult,
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
  phoneNumber?: string | null;
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
  phoneCodeSent: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneCode: (
    phoneE164: string,
    verifier: { verify: () => Promise<string>; type?: string }
  ) => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<void>;
  resetPhoneAuth: () => void;
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
    phoneNumber: u.phoneNumber,
    displayName: u.displayName || u.phoneNumber || u.email?.split('@')[0],
    photoURL: u.photoURL,
  };
}

function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s()-]/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.startsWith('00')) return `+${trimmed.slice(2)}`;
  // Assume North America if 10 digits
  if (/^\d{10}$/.test(trimmed)) return `+1${trimmed}`;
  if (/^\d{11,15}$/.test(trimmed)) return `+${trimmed}`;
  return trimmed;
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
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const verificationIdRef = useRef<string | null>(null);

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
      throw new Error('Google Sign-In works in the Android/iOS app build. Use email or phone on web.');
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
          'Google Sign-In needs a native build with EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Use email or phone for now.'
        );
      }
      throw e instanceof Error ? e : new Error(msg);
    }
  }, []);

  const sendPhoneCode = useCallback(
    async (
      phoneE164: string,
      verifier: { verify: () => Promise<string>; type?: string }
    ) => {
      if (!auth || !isFirebaseConfigured) {
        throw new Error('Firebase is required for phone login.');
      }
      const phone = normalizePhone(phoneE164);
      if (!/^\+\d{10,15}$/.test(phone)) {
        throw new Error('Enter a valid phone with country code, e.g. +14155552671');
      }

      try {
        const confirmation = await signInWithPhoneNumber(
          auth,
          phone,
          verifier as Parameters<typeof signInWithPhoneNumber>[2]
        );
        confirmationRef.current = confirmation;
        verificationIdRef.current = confirmation.verificationId;
        setPhoneCodeSent(true);
      } catch (e) {
        // Fallback path: obtain token then use PhoneAuthProvider
        try {
          const token = await verifier.verify();
          const provider = new PhoneAuthProvider(auth);
          const verificationId = await provider.verifyPhoneNumber(
            phone,
            // @ts-expect-error ApplicationVerifier shape from expo-firebase-recaptcha
            { ...verifier, verify: async () => token }
          );
          verificationIdRef.current = verificationId;
          confirmationRef.current = null;
          setPhoneCodeSent(true);
        } catch {
          throw e instanceof Error ? e : new Error('Could not send SMS code');
        }
      }
    },
    []
  );

  const confirmPhoneCode = useCallback(async (code: string) => {
    if (!auth) throw new Error('Firebase not ready');
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      throw new Error('Enter the 6-digit code from SMS');
    }

    if (confirmationRef.current) {
      await confirmationRef.current.confirm(trimmed);
      setPhoneCodeSent(false);
      confirmationRef.current = null;
      return;
    }

    if (!verificationIdRef.current) {
      throw new Error('Request a verification code first');
    }
    const credential = PhoneAuthProvider.credential(
      verificationIdRef.current,
      trimmed
    );
    await signInWithCredential(auth, credential);
    setPhoneCodeSent(false);
    verificationIdRef.current = null;
  }, []);

  const resetPhoneAuth = useCallback(() => {
    confirmationRef.current = null;
    verificationIdRef.current = null;
    setPhoneCodeSent(false);
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
            const identity = fbUser.email || fbUser.phoneNumber;
            if (identity) {
              await upsertUserProfile(fbUser.uid, identity);
              if (fbUser.email && isAdminEmail(fbUser.email)) {
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
    resetPhoneAuth();
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch {
      // optional
    }
    if (auth) await firebaseSignOut(auth);
  }, [resetPhoneAuth]);

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
      phoneCodeSent,
      signIn,
      signUp,
      signInWithGoogle,
      sendPhoneCode,
      confirmPhoneCode,
      resetPhoneAuth,
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
      phoneCodeSent,
      signIn,
      signUp,
      signInWithGoogle,
      sendPhoneCode,
      confirmPhoneCode,
      resetPhoneAuth,
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
