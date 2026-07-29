import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { PantryItem, Recipe } from '../types';

export type ProSource = 'free' | 'play' | 'admin' | 'promo';

export type UserEntitlement = {
  planId: 'free' | 'pro';
  proSource: ProSource;
  grantedAt?: number;
  grantedBy?: string;
  expiresAt?: number | null;
};

function emailKey(email: string): string {
  return email.trim().toLowerCase().replace(/\./g, ',');
}

function entitlementRef(email: string) {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, 'proGrants', emailKey(email));
}

function userRef(uid: string) {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, 'users', uid);
}

export async function fetchEntitlementByEmail(
  email: string
): Promise<UserEntitlement> {
  if (!isFirebaseConfigured || !db) {
    return { planId: 'free', proSource: 'free' };
  }
  const snap = await getDoc(entitlementRef(email));
  if (!snap.exists()) return { planId: 'free', proSource: 'free' };
  const data = snap.data();
  if (data.revoked) return { planId: 'free', proSource: 'free' };
  return {
    planId: 'pro',
    proSource: (data.source as ProSource) || 'admin',
    grantedAt: data.grantedAt?.toMillis?.() ?? data.grantedAt,
    grantedBy: data.grantedBy,
    expiresAt: data.expiresAt ?? null,
  };
}

export function subscribeEntitlement(
  email: string | null | undefined,
  onChange: (ent: UserEntitlement) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db || !email) {
    onChange({ planId: 'free', proSource: 'free' });
    return () => undefined;
  }
  return onSnapshot(entitlementRef(email), (snap) => {
    if (!snap.exists() || snap.data().revoked) {
      onChange({ planId: 'free', proSource: 'free' });
      return;
    }
    const data = snap.data();
    onChange({
      planId: 'pro',
      proSource: (data.source as ProSource) || 'admin',
      grantedAt: data.grantedAt?.toMillis?.() ?? Date.now(),
      grantedBy: data.grantedBy,
      expiresAt: data.expiresAt ?? null,
    });
  });
}

export async function grantProToEmail(
  targetEmail: string,
  grantedByEmail: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const key = emailKey(targetEmail);
  await setDoc(entitlementRef(targetEmail), {
    email: targetEmail.trim().toLowerCase(),
    emailKey: key,
    source: 'admin',
    grantedBy: grantedByEmail,
    grantedAt: serverTimestamp(),
    revoked: false,
    expiresAt: null,
  });
}

export async function revokeProFromEmail(targetEmail: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await setDoc(
    entitlementRef(targetEmail),
    { revoked: true, revokedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function upsertUserProfile(
  uid: string,
  email: string,
  extra: Record<string, unknown> = {}
): Promise<void> {
  if (!db) return;
  await setDoc(
    userRef(uid),
    {
      email: email.toLowerCase(),
      updatedAt: serverTimestamp(),
      ...extra,
    },
    { merge: true }
  );
}

export async function syncPantryToCloud(uid: string, items: PantryItem[]): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid, 'data', 'pantry');
  await setDoc(ref, { items, updatedAt: serverTimestamp() });
}

export async function syncRecipesToCloud(uid: string, items: Recipe[]): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid, 'data', 'recipes');
  await setDoc(ref, { items, updatedAt: serverTimestamp() });
}

export async function pullPantryFromCloud(uid: string): Promise<PantryItem[] | null> {
  if (!db) return null;
  const ref = doc(db, 'users', uid, 'data', 'pantry');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data().items as PantryItem[]) ?? null;
}

export async function pullRecipesFromCloud(uid: string): Promise<Recipe[] | null> {
  if (!db) return null;
  const ref = doc(db, 'users', uid, 'data', 'recipes');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data().items as Recipe[]) ?? null;
}

export async function ensureAdminRecord(uid: string, email: string): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'admins', uid), { email: email.toLowerCase(), active: true }, { merge: true });
}

export async function isFirestoreAdmin(uid: string): Promise<boolean> {
  if (!db) return false;
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists() && snap.data()?.active !== false;
}
