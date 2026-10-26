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
    expect(normalizeIngredient('pepper')).toBe('black pepper');
    expect(normalizeIngredient('Black pepper')).toBe('black pepper');
    expect(normalizeIngredient('ground black pepper')).toBe('black pepper');
  });

  it('matches ingredients flexibly', () => {
    const pantry = ['egg', 'butter', 'bread'];
    expect(isIngredientMatched('egg', pantry)).toBe(true);
    expect(isIngredientMatched('butter', pantry)).toBe(true);
    expect(isIngredientMatched('chicken breast', pantry)).toBe(false);
    expect(isIngredientMatched('pepper', ['black pepper'])).toBe(true);
    expect(
      isIngredientMatched('black pepper', ['pepper', 'black pepper', 'ground black pepper'])
    ).toBe(true);
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
    expect(RECIPES_DATA).toHaveLength(35);
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

  it('includes representative African, South Asian, and Korean-inspired dishes', () => {
    expect(RECIPES_DATA.find((recipe) => recipe.id === 'jollof-style-rice-fish')?.cuisine)
      .toBe('West African-inspired');
    expect(RECIPES_DATA.find((recipe) => recipe.id === 'south-asian-chickpea-curry')?.cuisine)
      .toBe('South Asian-inspired');
    expect(RECIPES_DATA.find((recipe) => recipe.id === 'korean-inspired-beef-rice-bowl')?.cuisine)
      .toBe('Korean-inspired');
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

  it('strictly excludes recipes containing sesame when selected', () => {
    const results = matchAndRankRecipes(RECIPES_DATA, [], {
      ...defaultFilters,
      excludedAllergens: ['sesame'],
    });

    expect(results.all.some((result) => result.recipe.allergens.includes('sesame'))).toBe(false);
  });

  it('strictly excludes every selectable allergen category', () => {
    for (const allergen of [
      'dairy',
      'gluten',
      'eggs',
      'nuts',
      'soy',
      'seafood',
      'sesame',
    ] as const) {
      const results = matchAndRankRecipes(RECIPES_DATA, [], {
        ...defaultFilters,
        excludedAllergens: [allergen],
      });
      expect(
        results.all.every((result) => !result.recipe.allergens.includes(allergen))
      ).toBe(true);
    }
  });

  it('applies every meal, time, difficulty, dietary, and budget filter', () => {
    for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'] as const) {
      const results = matchAndRankRecipes(RECIPES_DATA, [], { ...defaultFilters, mealType });
      expect(results.all.length).toBeGreaterThan(0);
      expect(results.all.every((result) => result.recipe.mealType === mealType)).toBe(true);
    }

    expect(
      matchAndRankRecipes(RECIPES_DATA, [], { ...defaultFilters, maxTimeMinutes: 15 }).all.every(
        (result) => result.recipe.totalTimeMinutes <= 15
      )
    ).toBe(true);
    expect(
      matchAndRankRecipes(RECIPES_DATA, [], { ...defaultFilters, difficulty: 'medium' }).all.every(
        (result) => result.recipe.difficulty === 'medium'
      )
    ).toBe(true);

    for (const [filter, dietaryKey] of [
      ['isVegetarian', 'isVegetarian'],
      ['isVegan', 'isVegan'],
      ['isGlutenFree', 'isGlutenFree'],
      ['isDairyFree', 'isDairyFree'],
    ] as const) {
      const results = matchAndRankRecipes(RECIPES_DATA, [], {
        ...defaultFilters,
        [filter]: true,
      });
      expect(results.all.length).toBeGreaterThan(0);
      expect(results.all.every((result) => result.recipe.dietary[dietaryKey])).toBe(true);
    }

    const budgetResults = matchAndRankRecipes(RECIPES_DATA, [], {
      ...defaultFilters,
      budgetFriendlyOnly: true,
    });
    expect(budgetResults.all.length).toBeGreaterThan(0);
    expect(budgetResults.all.every((result) => result.recipe.budgetFriendly)).toBe(true);
  });

  it('sorts fastest and best-match results according to the selected priority', () => {
    const fastest = matchAndRankRecipes(RECIPES_DATA, [], {
      ...defaultFilters,
      sortBy: 'fastest',
    }).all;
    expect(fastest).toHaveLength(RECIPES_DATA.length);
    expect(fastest.every((item, index) =>
      index === 0 || fastest[index - 1].recipe.totalTimeMinutes <= item.recipe.totalTimeMinutes
    )).toBe(true);

    const bestMatch = matchAndRankRecipes(RECIPES_DATA, [], defaultFilters).all;
    expect(bestMatch.every((item, index) =>
      index === 0 || bestMatch[index - 1].score >= item.score
    )).toBe(true);

    const leastMissing = matchAndRankRecipes(RECIPES_DATA, [], {
      ...defaultFilters,
      sortBy: 'least-missing',
    }).all;
    expect(leastMissing.every((item, index) =>
      index === 0 ||
      leastMissing[index - 1].missingIngredients.length <= item.missingIngredients.length
    )).toBe(true);

    const expiringFirst = matchAndRankRecipes(
      RECIPES_DATA,
      [{ id: 'expiring-bread', name: 'Bread', normalizedName: 'bread', expiresSoon: true }],
      { ...defaultFilters, sortBy: 'expiring-first' }
    ).all;
    expect(expiringFirst.every((item, index) =>
      index === 0 ||
      expiringFirst[index - 1].expiringIngredientsUsed.length >= item.expiringIngredientsUsed.length
    )).toBe(true);
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
