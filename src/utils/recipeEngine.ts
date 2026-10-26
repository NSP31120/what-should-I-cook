import type { Recipe, UserIngredient, FilterState, RecipeMatchResult, IngredientItem } from '../types/recipe';
import { isIngredientMatched, normalizeIngredient } from '../utils/normalizer';

/**
 * Filter and rank recipes against user pantry ingredients and user filters.
 */
export function matchAndRankRecipes(
  recipes: Recipe[],
  userIngredients: UserIngredient[],
  filters: FilterState
): {
  makeNow: RecipeMatchResult[];
  missingFew: RecipeMatchResult[];
  other: RecipeMatchResult[];
  all: RecipeMatchResult[];
} {
  const userNormalizedList = userIngredients.map((i) => i.normalizedName);
  const expiringNormalizedSet = new Set(
    userIngredients
      .filter((i) => i.expiresSoon)
      .map((i) => normalizeIngredient(i.normalizedName))
  );

  const matchedResults: RecipeMatchResult[] = [];

  for (const recipe of recipes) {
    // 1. ALLERGY FILTER (STRICT: Never show recipes that conflict with an excluded allergen)
    const hasConflictAllergen = recipe.allergens.some((allergen) =>
      filters.excludedAllergens.includes(allergen)
    );
    if (hasConflictAllergen) {
      continue;
    }

    // 2. DIETARY FILTERS
    if (filters.isVegetarian && !recipe.dietary.isVegetarian) continue;
    if (filters.isVegan && !recipe.dietary.isVegan) continue;
    if (filters.isGlutenFree && !recipe.dietary.isGlutenFree) continue;
    if (filters.isDairyFree && !recipe.dietary.isDairyFree) continue;

    // 3. MEAL TYPE FILTER
    if (filters.mealType !== 'all' && recipe.mealType !== filters.mealType) {
      continue;
    }

    // 4. MAX TIME FILTER
    if (filters.maxTimeMinutes !== 'all' && recipe.totalTimeMinutes > filters.maxTimeMinutes) {
      continue;
    }

    // 5. DIFFICULTY FILTER
    if (filters.difficulty !== 'all' && recipe.difficulty !== filters.difficulty) {
      continue;
    }

    // 6. BUDGET-FRIENDLY FILTER
    if (filters.budgetFriendlyOnly && !recipe.budgetFriendly) {
      continue;
    }

    // INGREDIENT MATCHING
    const nonOptionalIngredients = recipe.ingredients.filter((ing) => !ing.optional);
    const totalCount = nonOptionalIngredients.length;

    const matchedIngredients: string[] = [];
    const missingIngredients: IngredientItem[] = [];
    const expiringIngredientsUsed: string[] = [];

    for (const ing of recipe.ingredients) {
      const isMatched = isIngredientMatched(ing.normalizedName, userNormalizedList);
      if (isMatched) {
        matchedIngredients.push(ing.name);
        if (expiringNormalizedSet.has(normalizeIngredient(ing.normalizedName))) {
          expiringIngredientsUsed.push(ing.name);
        }
      } else if (!ing.optional) {
        missingIngredients.push(ing);
      }
    }

    // Matched non-optional count
    const matchedCount = totalCount - missingIngredients.length;
    const matchPercentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 100;

    // Categorization
    let category: 'make-now' | 'missing-few' | 'other';
    if (missingIngredients.length === 0) {
      category = 'make-now';
    } else if (missingIngredients.length <= 2) {
      category = 'missing-few';
    } else {
      category = 'other';
    }

    // Scoring formula:
    // Higher percentage = higher score
    // Expiring ingredient bonus: +25 pts each (prioritize reducing food waste!)
    // Fewer missing ingredients = bonus
    // Shorter cook time = small tie breaker bonus
    let score = matchPercentage * 2;
    score += expiringIngredientsUsed.length * 30;
    score -= missingIngredients.length * 15;
    score -= recipe.totalTimeMinutes * 0.1;

    matchedResults.push({
      recipe,
      matchPercentage,
      matchedIngredients,
      missingIngredients,
      expiringIngredientsUsed,
      score,
      category,
    });
  }

  // Sorting
  matchedResults.sort((a, b) => {
    switch (filters.sortBy) {
      case 'least-missing':
        if (a.missingIngredients.length !== b.missingIngredients.length) {
          return a.missingIngredients.length - b.missingIngredients.length;
        }
        return b.matchPercentage - a.matchPercentage;

      case 'fastest':
        return a.recipe.totalTimeMinutes - b.recipe.totalTimeMinutes;

      case 'expiring-first':
        if (b.expiringIngredientsUsed.length !== a.expiringIngredientsUsed.length) {
          return b.expiringIngredientsUsed.length - a.expiringIngredientsUsed.length;
        }
        return b.score - a.score;

      case 'best-match':
      default:
        return b.score - a.score;
    }
  });

  const makeNow = matchedResults.filter((r) => r.category === 'make-now');
  const missingFew = matchedResults.filter((r) => r.category === 'missing-few');
  const other = matchedResults.filter((r) => r.category === 'other');

  return {
    makeNow,
    missingFew,
    other,
    all: matchedResults,
  };
}
