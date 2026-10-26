export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Allergen = 'dairy' | 'gluten' | 'eggs' | 'nuts' | 'soy' | 'seafood' | 'sesame';

export interface IngredientItem {
  id: string;
  name: string; // display name e.g. "large eggs"
  normalizedName: string; // canonical name e.g. "egg"
  amount: number;
  unit: string;
  optional?: boolean;
}

export interface UserIngredient {
  id: string;
  name: string;
  normalizedName: string;
  expiresSoon?: boolean; // "Use these first" flag
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  mealType: MealType;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  difficulty: Difficulty;
  baseServings: number;
  ingredients: IngredientItem[];
  instructions: string[];
  dietary: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
  };
  allergens: Allergen[];
  tags: string[];
  cuisine?: string;
  imageUrl?: string;
  budgetFriendly?: boolean;
}

export interface RecipeMatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: IngredientItem[];
  expiringIngredientsUsed: string[];
  score: number;
  category: 'make-now' | 'missing-few' | 'other';
}

export interface FilterState {
  mealType: MealType | 'all';
  maxTimeMinutes: number | 'all';
  difficulty: Difficulty | 'all';
  servings: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  excludedAllergens: Allergen[];
  budgetFriendlyOnly: boolean;
  sortBy: 'best-match' | 'least-missing' | 'fastest' | 'expiring-first';
}
