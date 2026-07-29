import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ChatMessage,
  MealPlanItem,
  PantryItem,
  Recipe,
  ScanUsage,
  ShoppingItem,
  SubscriptionState,
} from '../types';

const keys = {
  pantry: '@cookcan/pantry',
  recipes: '@cookcan/recipes',
  shopping: '@cookcan/shopping',
  meals: '@cookcan/meals',
  chat: '@cookcan/chat',
  usage: '@cookcan/scan_usage',
  subscription: '@cookcan/subscription',
  onboarding: '@cookcan/onboarding_done',
  country: '@cookcan/country',
  diets: '@cookcan/diets',
  cuisines: '@cookcan/cuisines',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getPantry: () => readJson<PantryItem[]>(keys.pantry, []),
  setPantry: (items: PantryItem[]) => writeJson(keys.pantry, items),

  getRecipes: () => readJson<Recipe[]>(keys.recipes, []),
  setRecipes: (items: Recipe[]) => writeJson(keys.recipes, items),

  getShopping: () => readJson<ShoppingItem[]>(keys.shopping, []),
  setShopping: (items: ShoppingItem[]) => writeJson(keys.shopping, items),

  getMeals: () => readJson<MealPlanItem[]>(keys.meals, []),
  setMeals: (items: MealPlanItem[]) => writeJson(keys.meals, items),

  getChat: () => readJson<ChatMessage[]>(keys.chat, []),
  setChat: (items: ChatMessage[]) => writeJson(keys.chat, items),

  getUsage: () => readJson<ScanUsage | null>(keys.usage, null),
  setUsage: (usage: ScanUsage) => writeJson(keys.usage, usage),

  getSubscription: () =>
    readJson<SubscriptionState>(keys.subscription, {
      planId: 'free',
      productId: null,
      billingPeriod: null,
      expiresAt: null,
      isActive: false,
      localizedPrice: null,
      localizedYearlyPrice: null,
      currencyCode: null,
      storeCountry: null,
    }),
  setSubscription: (sub: SubscriptionState) => writeJson(keys.subscription, sub),

  getOnboardingDone: async () => (await AsyncStorage.getItem(keys.onboarding)) === '1',
  setOnboardingDone: async () => AsyncStorage.setItem(keys.onboarding, '1'),

  getCountry: () => AsyncStorage.getItem(keys.country),
  setCountry: (c: string) => AsyncStorage.setItem(keys.country, c),

  getDiets: () => readJson<string[]>(keys.diets, []),
  setDiets: (diets: string[]) => writeJson(keys.diets, diets),

  getCuisines: () => readJson<string[]>(keys.cuisines, []),
  setCuisines: (cuisines: string[]) => writeJson(keys.cuisines, cuisines),
};

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
