import type { Recipe } from '../types';
import { uid } from './storage';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function apiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
}

async function callGemini(parts: Array<Record<string, unknown>>, system?: string) {
  const key = apiKey();
  if (!key) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

function localIngredients(): Array<{ name: string; quantity: number; unit: string; category: string }> {
  return [
    { name: 'Tomato', quantity: 2, unit: 'pcs', category: 'Produce' },
    { name: 'Garlic', quantity: 1, unit: 'bulb', category: 'Produce' },
    { name: 'Olive Oil', quantity: 1, unit: 'bottle', category: 'Pantry' },
    { name: 'Basil', quantity: 1, unit: 'bunch', category: 'Produce' },
  ];
}

function localRecipes(ingredients: string[]): Recipe[] {
  const list = ingredients.slice(0, 4).join(', ') || 'pantry staples';
  return [
    {
      id: uid('recipe'),
      title: 'Skillet Garden Pasta',
      description: `A warm weeknight pasta built around ${list}.`,
      ingredients: [...ingredients, 'Pasta', 'Salt', 'Pepper'],
      steps: [
        'Boil pasta until al dente.',
        'Sauté aromatics and main ingredients in olive oil.',
        'Toss with pasta, season, and finish with herbs.',
      ],
      cookTimeMinutes: 25,
      difficulty: 'Easy',
      cuisine: 'Italian',
      createdAt: Date.now(),
    },
    {
      id: uid('recipe'),
      title: 'One-Pan Herb Roast',
      description: `Roasted comfort using ${list}.`,
      ingredients: [...ingredients, 'Lemon', 'Olive oil'],
      steps: [
        'Preheat oven to 425°F (220°C).',
        'Toss ingredients with oil and seasoning.',
        'Roast 20–25 minutes until caramelized.',
      ],
      cookTimeMinutes: 35,
      difficulty: 'Medium',
      cuisine: 'Mediterranean',
      createdAt: Date.now(),
    },
  ];
}

export async function analyzeIngredientImage(
  base64: string,
  mimeType = 'image/jpeg'
): Promise<Array<{ name: string; quantity: number; unit: string; category: string }>> {
  if (!apiKey()) {
    return localIngredients();
  }

  const text = await callGemini(
    [
      {
        inlineData: { mimeType, data: base64 },
      },
      {
        text: 'Identify edible ingredients in this photo. Return JSON: {"ingredients":[{"name":"","quantity":1,"unit":"pcs","category":"Produce|Meat|Dairy|Pantry|Spices|Other"}]}',
      },
    ],
    'You are CookCan, a Michelin-inspired kitchen companion. Be precise and practical.'
  );

  try {
    const parsed = JSON.parse(text);
    return parsed.ingredients ?? localIngredients();
  } catch {
    return localIngredients();
  }
}

export async function generateRecipesFromPantry(
  ingredients: string[],
  diets: string[] = []
): Promise<Recipe[]> {
  if (!apiKey()) {
    return localRecipes(ingredients);
  }

  const text = await callGemini(
    [
      {
        text: `Create 3 recipes using these ingredients: ${ingredients.join(', ')}. Dietary prefs: ${diets.join(', ') || 'none'}. Return JSON: {"recipes":[{"title":"","description":"","ingredients":[],"steps":[],"cookTimeMinutes":20,"difficulty":"Easy|Medium|Hard","cuisine":""}]}`,
      },
    ],
    'You are CookCan. Recipes should feel premium, warm, and achievable at home.'
  );

  try {
    const parsed = JSON.parse(text);
    return (parsed.recipes ?? []).map((r: Omit<Recipe, 'id' | 'createdAt'>) => ({
      ...r,
      id: uid('recipe'),
      createdAt: Date.now(),
    }));
  } catch {
    return localRecipes(ingredients);
  }
}

export async function chatWithChef(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  pantry: string[]
): Promise<string> {
  if (!apiKey()) {
    return `With ${pantry.slice(0, 3).join(', ') || 'your pantry'}, try a quick sauté with garlic and olive oil, finish with acid (lemon) and herbs. Want a full recipe next?`;
  }

  const transcript = messages
    .slice(-8)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const text = await callGemini(
    [
      {
        text: `Pantry: ${pantry.join(', ') || 'unknown'}\nConversation:\n${transcript}\nReply as CookCan AI Chef in JSON: {"reply":"..."}`,
      },
    ],
    'You are CookCan AI Chef. Concise, warm, practical cooking advice.'
  );

  try {
    return JSON.parse(text).reply ?? text;
  } catch {
    return text;
  }
}
