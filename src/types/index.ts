export type PlanId = 'free' | 'pro';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  freshness?: string;
  confidence?: number;
  createdAt: number;
  expirationDate?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine?: string;
  imageUrl?: string;
  inProgressStep?: number;
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  quantity?: string;
  createdAt: number;
}

export interface MealPlanItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  recipeId?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface ScanUsage {
  monthKey: string; // YYYY-MM
  count: number;
}

export interface SubscriptionState {
  planId: PlanId;
  productId: string | null;
  expiresAt: number | null;
  isActive: boolean;
  localizedPrice: string | null;
  currencyCode: string | null;
  storeCountry: string | null;
}

export type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Main: undefined;
  Scanning: undefined;
  RecipeResults: { recipes: Recipe[] };
  RecipeDetail: { recipeId: string };
  MealPlanner: undefined;
  Paywall: { reason?: string } | undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pantry: undefined;
  AIChef: undefined;
  Grocery: undefined;
};
