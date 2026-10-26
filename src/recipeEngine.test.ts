import { describe, it, expect } from 'vitest';
import { normalizeIngredient, isIngredientMatched } from '../src/utils/normalizer';
import { matchAndRankRecipes } from '../src/utils/recipeEngine';
import { RECIPES_DATA } from '../src/data/recipes';
import { RECIPE_IMAGE_URLS } from '../src/data/recipeImages';
import type { UserIngredient, FilterState } from '../src/types/recipe';

describe('normalizer', () => {
  it('normalizes common ingredient synonyms', () => {
    expect(normalizeIngredient('Yellow Onions')).toBe('onion');
    expect(normalizeIngredient('Eggs')).toBe('egg');
    expect(normalizeIngredient('Large eggs')).toBe('egg');
    expect(normalizeIngredient('Garlic cloves')).toBe('garlic');
    expect(normalizeIngredient('Extra virgin olive oil')).toBe('olive oil');
    expect(normalizeIngredient('Old fashioned oats')).toBe('oats');
  });

  it('matches ingredients flexibly', () => {
    const pantry = ['egg', 'butter', 'bread'];
    expect(isIngredientMatched('egg', pantry)).toBe(true);
    expect(isIngredientMatched('butter', pantry)).toBe(true);
    expect(isIngredientMatched('chicken breast', pantry)).toBe(false);
  });
});

describe('recipeEngine', () => {
  const defaultFilters: FilterState = {
    mealType: 'all',
    maxTimeMinutes: 'all',
    difficulty: 'all',
    servings: 2,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    excludedAllergens: [],
    budgetFriendlyOnly: false,
    sortBy: 'best-match',
  };

  it('contains at least 30 recipes across all meal types', () => {
    expect(RECIPES_DATA.length).toBeGreaterThanOrEqual(30);
    const mealTypes = new Set(RECIPES_DATA.map((r) => r.mealType));
    expect(mealTypes.has('breakfast')).toBe(true);
    expect(mealTypes.has('lunch')).toBe(true);
    expect(mealTypes.has('dinner')).toBe(true);
    expect(mealTypes.has('snack')).toBe(true);
    expect(mealTypes.has('dessert')).toBe(true);
  });

  it('provides a photo URL for every recipe', () => {
    expect(Object.keys(RECIPE_IMAGE_URLS).sort()).toEqual(
      RECIPES_DATA.map((recipe) => recipe.id).sort()
    );
    expect(Object.values(RECIPE_IMAGE_URLS).every((url) => url.startsWith('https://images.unsplash.com/'))).toBe(true);
  });

  it('ranks 100% matched recipes into makeNow', () => {
    const pantry: UserIngredient[] = [
      { id: '1', name: 'Eggs', normalizedName: 'egg' },
      { id: '2', name: 'Butter', normalizedName: 'butter' },
      { id: '3', name: 'Salt', normalizedName: 'salt' },
    ];

    const results = matchAndRankRecipes(RECIPES_DATA, pantry, defaultFilters);
    expect(results.makeNow.length).toBeGreaterThan(0);
    // Velvety Soft Scrambled Eggs only needs eggs, butter, salt (bread is optional)
    const scrambled = results.makeNow.find((r) => r.recipe.id === 'fluffy-scrambled-eggs');
    expect(scrambled).toBeDefined();
    expect(scrambled?.missingIngredients.length).toBe(0);
  });

  it('strictly excludes recipes containing an excluded allergen', () => {
    const pantry: UserIngredient[] = [
      { id: '1', name: 'Eggs', normalizedName: 'egg' },
      { id: '2', name: 'Butter', normalizedName: 'butter' },
      { id: '3', name: 'Bread', normalizedName: 'bread' },
    ];

    const filtersWithAllergy: FilterState = {
      ...defaultFilters,
      excludedAllergens: ['eggs'],
    };

    const results = matchAndRankRecipes(RECIPES_DATA, pantry, filtersWithAllergy);
    const hasAnyEggRecipe = results.all.some((r) => r.recipe.allergens.includes('eggs'));
    expect(hasAnyEggRecipe).toBe(false);
  });

  it('gives priority boost to recipes that use expiring ingredients', () => {
    const pantryWithExpiring: UserIngredient[] = [
      { id: '1', name: 'Bread', normalizedName: 'bread', expiresSoon: true },
      { id: '2', name: 'Butter', normalizedName: 'butter', expiresSoon: false },
      { id: '3', name: 'Sugar', normalizedName: 'sugar', expiresSoon: false },
    ];

    const results = matchAndRankRecipes(RECIPES_DATA, pantryWithExpiring, {
      ...defaultFilters,
      sortBy: 'expiring-first',
    });

    const topMatch = results.all[0];
    expect(topMatch.expiringIngredientsUsed.length).toBeGreaterThan(0);
  });
});
