import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ChatMessage,
  MealPlanItem,
  PantryItem,
  Recipe,
  ShoppingItem,
} from '../types';
import { monthKey, storage, uid } from '../lib/storage';
import { FREE_SCANS_PER_MONTH } from '../constants/billing';
import { useBilling } from './BillingContext';
import { useAuth } from './AuthContext';
import {
  pullPantryFromCloud,
  pullRecipesFromCloud,
  syncPantryToCloud,
  syncRecipesToCloud,
} from '../lib/entitlements';
import { isFirebaseConfigured } from '../lib/firebase';

type DataContextValue = {
  ready: boolean;
  pantry: PantryItem[];
  recipes: Recipe[];
  shopping: ShoppingItem[];
  meals: MealPlanItem[];
  chat: ChatMessage[];
  diets: string[];
  scansUsed: number;
  scansRemaining: number;
  canScan: boolean;
  addPantryItems: (items: Omit<PantryItem, 'id' | 'createdAt'>[]) => Promise<void>;
  removePantryItem: (id: string) => Promise<void>;
  saveRecipes: (items: Recipe[]) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  addShoppingItem: (name: string, category?: string) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  removeShoppingItem: (id: string) => Promise<void>;
  addMeal: (item: Omit<MealPlanItem, 'id' | 'createdAt'>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  appendChat: (role: 'user' | 'assistant', content: string) => Promise<void>;
  clearChat: () => Promise<void>;
  setDiets: (diets: string[]) => Promise<void>;
  consumeScan: () => Promise<boolean>;
  seedStarterPantry: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isPro } = useBilling();
  const { user, isLocalUser } = useAuth();
  const [ready, setReady] = useState(false);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<MealPlanItem[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [diets, setDietsState] = useState<string[]>([]);
  const [scansUsed, setScansUsed] = useState(0);

  useEffect(() => {
    (async () => {
      const [p, r, s, m, c, d, usage] = await Promise.all([
        storage.getPantry(),
        storage.getRecipes(),
        storage.getShopping(),
        storage.getMeals(),
        storage.getChat(),
        storage.getDiets(),
        storage.getUsage(),
      ]);
      setPantry(p);
      setRecipes(r);
      setShopping(s);
      setMeals(m);
      setChat(c);
      setDietsState(d);
      const key = monthKey();
      setScansUsed(usage?.monthKey === key ? usage.count : 0);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user?.id || isLocalUser || user.id === 'local') return;

    let cancelled = false;
    (async () => {
      const [cloudPantry, cloudRecipes] = await Promise.all([
        pullPantryFromCloud(user.id),
        pullRecipesFromCloud(user.id),
      ]);
      if (cancelled) return;
      if (cloudPantry?.length) {
        setPantry(cloudPantry);
        await storage.setPantry(cloudPantry);
      }
      if (cloudRecipes?.length) {
        setRecipes(cloudRecipes);
        await storage.setRecipes(cloudRecipes);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isLocalUser]);

  useEffect(() => {
    if (!isFirebaseConfigured || !user?.id || isLocalUser || user.id === 'local') return;
    const timer = setTimeout(() => {
      void syncPantryToCloud(user.id, pantry);
    }, 800);
    return () => clearTimeout(timer);
  }, [pantry, user?.id, isLocalUser]);

  useEffect(() => {
    if (!isFirebaseConfigured || !user?.id || isLocalUser || user.id === 'local') return;
    const timer = setTimeout(() => {
      void syncRecipesToCloud(user.id, recipes);
    }, 800);
    return () => clearTimeout(timer);
  }, [recipes, user?.id, isLocalUser]);

  const scansRemaining = isPro
    ? Infinity
    : Math.max(0, FREE_SCANS_PER_MONTH - scansUsed);
  const canScan = isPro || scansRemaining > 0;

  const addPantryItems = useCallback(
    async (items: Omit<PantryItem, 'id' | 'createdAt'>[]) => {
      const next = [
        ...items.map((item) => ({
          ...item,
          id: uid('pantry'),
          createdAt: Date.now(),
        })),
        ...pantry,
      ];
      setPantry(next);
      await storage.setPantry(next);
    },
    [pantry]
  );

  const removePantryItem = useCallback(
    async (id: string) => {
      const next = pantry.filter((p) => p.id !== id);
      setPantry(next);
      await storage.setPantry(next);
    },
    [pantry]
  );

  const saveRecipes = useCallback(
    async (items: Recipe[]) => {
      const next = [...items, ...recipes];
      setRecipes(next);
      await storage.setRecipes(next);
    },
    [recipes]
  );

  const getRecipe = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes]
  );

  const addShoppingItem = useCallback(
    async (name: string, category = 'Other') => {
      const next = [
        {
          id: uid('shop'),
          name,
          category,
          checked: false,
          createdAt: Date.now(),
        },
        ...shopping,
      ];
      setShopping(next);
      await storage.setShopping(next);
    },
    [shopping]
  );

  const toggleShoppingItem = useCallback(
    async (id: string) => {
      const next = shopping.map((s) =>
        s.id === id ? { ...s, checked: !s.checked } : s
      );
      setShopping(next);
      await storage.setShopping(next);
    },
    [shopping]
  );

  const removeShoppingItem = useCallback(
    async (id: string) => {
      const next = shopping.filter((s) => s.id !== id);
      setShopping(next);
      await storage.setShopping(next);
    },
    [shopping]
  );

  const addMeal = useCallback(
    async (item: Omit<MealPlanItem, 'id' | 'createdAt'>) => {
      const next = [{ ...item, id: uid('meal'), createdAt: Date.now() }, ...meals];
      setMeals(next);
      await storage.setMeals(next);
    },
    [meals]
  );

  const removeMeal = useCallback(
    async (id: string) => {
      const next = meals.filter((m) => m.id !== id);
      setMeals(next);
      await storage.setMeals(next);
    },
    [meals]
  );

  const appendChat = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      const next = [
        ...chat,
        { id: uid('chat'), role, content, createdAt: Date.now() },
      ];
      setChat(next);
      await storage.setChat(next);
    },
    [chat]
  );

  const clearChat = useCallback(async () => {
    setChat([]);
    await storage.setChat([]);
  }, []);

  const setDiets = useCallback(async (next: string[]) => {
    setDietsState(next);
    await storage.setDiets(next);
  }, []);

  const consumeScan = useCallback(async () => {
    if (isPro) return true;
    const key = monthKey();
    if (scansUsed >= FREE_SCANS_PER_MONTH) return false;
    const count = scansUsed + 1;
    setScansUsed(count);
    await storage.setUsage({ monthKey: key, count });
    return true;
  }, [isPro, scansUsed]);

  const seedStarterPantry = useCallback(async () => {
    if (pantry.length) return;
    const defaults: Omit<PantryItem, 'id' | 'createdAt'>[] = [
      { name: 'Wild Salmon', quantity: 1, unit: 'lb', category: 'Meat', freshness: 'Fresh' },
      { name: 'Heirloom Tomato', quantity: 3, unit: 'pcs', category: 'Produce', freshness: 'Ripe' },
      { name: 'Fresh Garlic', quantity: 1, unit: 'bulb', category: 'Produce', freshness: 'Fresh' },
      { name: 'Rosemary', quantity: 2, unit: 'sprigs', category: 'Spices', freshness: 'Fresh' },
      { name: 'Sea Salt', quantity: 100, unit: 'g', category: 'Pantry', freshness: 'Fresh' },
    ];
    await addPantryItems(defaults);
  }, [addPantryItems, pantry.length]);

  const value = useMemo(
    () => ({
      ready,
      pantry,
      recipes,
      shopping,
      meals,
      chat,
      diets,
      scansUsed,
      scansRemaining,
      canScan,
      addPantryItems,
      removePantryItem,
      saveRecipes,
      getRecipe,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      addMeal,
      removeMeal,
      appendChat,
      clearChat,
      setDiets,
      consumeScan,
      seedStarterPantry,
    }),
    [
      ready,
      pantry,
      recipes,
      shopping,
      meals,
      chat,
      diets,
      scansUsed,
      scansRemaining,
      canScan,
      addPantryItems,
      removePantryItem,
      saveRecipes,
      getRecipe,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      addMeal,
      removeMeal,
      appendChat,
      clearChat,
      setDiets,
      consumeScan,
      seedStarterPantry,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
