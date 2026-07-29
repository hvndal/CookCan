export const CUISINES = [
  'Italian',
  'Indian',
  'Japanese',
  'Mexican',
  'Mediterranean',
  'French',
  'Chinese',
  'Thai',
  'Korean',
  'American',
] as const;

export const DIETARY_PREFS = [
  'Vegan',
  'Vegetarian',
  'Keto',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Calorie Deficit',
  'Halal',
  'Paleo',
] as const;

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export const COOK_TIMES = [15, 30, 45, 60] as const;

export type Cuisine = (typeof CUISINES)[number];
export type DietaryPref = (typeof DIETARY_PREFS)[number];
export type MealType = (typeof MEAL_TYPES)[number];
