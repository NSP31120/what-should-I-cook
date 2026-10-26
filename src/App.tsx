import { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PantryInput } from './components/PantryInput';
import { FilterBar } from './components/FilterBar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeAccordion } from './components/RecipeAccordion';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { RECIPES_DATA } from './data/recipes';
import { matchAndRankRecipes } from './utils/recipeEngine';
import { normalizeIngredient } from './utils/normalizer';
import type { UserIngredient, FilterState } from './types/recipe';
import { Utensils, Heart, RotateCcw } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
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

// Initial starter pantry so first-time users immediately see how it works!
const INITIAL_PANTRY: UserIngredient[] = [
  { id: 'init-1', name: 'Eggs', normalizedName: 'egg', expiresSoon: false },
  { id: 'init-2', name: 'Butter', normalizedName: 'butter', expiresSoon: false },
  { id: 'init-3', name: 'Bread', normalizedName: 'bread', expiresSoon: true },
  { id: 'init-4', name: 'Garlic', normalizedName: 'garlic', expiresSoon: false },
];

export function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'favorites' | 'pantry'>('discover');
  const [ingredients, setIngredients] = useLocalStorage<UserIngredient[]>('wsic_pantry_v1', INITIAL_PANTRY);
  const [filters, setFilters] = useLocalStorage<FilterState>('wsic_filters_v1', DEFAULT_FILTERS);
  const [favorites, setFavorites] = useLocalStorage<string[]>('wsic_favorites_v1', []);
  const [cookedRecipes, setCookedRecipes] = useLocalStorage<string[]>('wsic_cooked_v1', []);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const handleCloseRecipe = useCallback(() => setSelectedRecipeId(null), []);

  // Add ingredient
  const handleAddIngredient = (name: string, expiresSoon = false) => {
    const normalizedName = normalizeIngredient(name);
    if (ingredients.some((ingredient) => normalizeIngredient(ingredient.normalizedName) === normalizedName)) {
      return;
    }

    const newIngredient: UserIngredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      normalizedName,
      expiresSoon,
    };
    setIngredients((prev) => [...prev, newIngredient]);
  };

  // Remove ingredient
  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // Toggle "Use these first" expiring state
  const handleToggleExpiresSoon = (id: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, expiresSoon: !i.expiresSoon } : i))
    );
  };

  // Clear pantry
  const handleClearPantry = () => {
    setIngredients([]);
  };

  // Reset everything
  const handleResetAll = () => {
    if (window.confirm('Reset all pantry ingredients and custom filters to defaults?')) {
      setIngredients(INITIAL_PANTRY);
      setFilters(DEFAULT_FILTERS);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (recipeId: string) => {
    setFavorites((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  // Mark recipe cooked
  const handleMarkCooked = (recipeId: string) => {
    setCookedRecipes((prev) =>
      prev.includes(recipeId) ? prev : [...prev, recipeId]
    );
  };

  // Compute matches and ranking
  const { makeNow, missingFew, other, all } = useMemo(() => {
    return matchAndRankRecipes(RECIPES_DATA, ingredients, filters);
  }, [ingredients, filters]);

  // Selected recipe object
  const selectedRecipe = useMemo(() => {
    if (!selectedRecipeId) return null;
    return RECIPES_DATA.find((r) => r.id === selectedRecipeId) || null;
  }, [selectedRecipeId]);

  // Favorites list
  const favoriteResults = useMemo(() => {
    return all.filter((r) => favorites.includes(r.recipe.id));
  }, [all, favorites]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top App Header */}
      <Header
        onResetAll={handleResetAll}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setActiveTab('favorites')}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Banner */}
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('pantry-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          pantryCount={ingredients.length}
        />

        {/* Tab 1: Discover & Match */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            {/* Input & Filters Grid */}
            <div id="pantry-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <PantryInput
                  ingredients={ingredients}
                  onAddIngredient={handleAddIngredient}
                  onRemoveIngredient={handleRemoveIngredient}
                  onToggleExpiresSoon={handleToggleExpiresSoon}
                  onClearAll={handleClearPantry}
                />
              </div>

              <div className="lg:col-span-5">
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                />
              </div>
            </div>

            {/* Match Results Categories */}
            <div className="space-y-10 pt-4">
              
              {/* Category 1: Recipes you can make right now (100% matched) */}
              <section aria-labelledby="make-now-heading">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h2 id="make-now-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                        Ready to Make Now
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500">
                        You have 100% of the core ingredients required for these dishes.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {makeNow.length} {makeNow.length === 1 ? 'recipe' : 'recipes'}
                  </span>
                </div>

                {makeNow.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {makeNow.map((item) => (
                      <RecipeCard
                        key={item.recipe.id}
                        matchResult={item}
                        isFavorite={favorites.includes(item.recipe.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectRecipe={setSelectedRecipeId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white border border-stone-200/90 text-center text-sm text-stone-500">
                    <p className="font-medium text-stone-700">No complete matches found yet.</p>
                    <p className="mt-1 text-xs">
                      Try adding a few more common kitchen staples like <strong>pasta, rice, garlic</strong> or <strong>cheese</strong>.
                    </p>
                  </div>
                )}
              </section>

              {/* Category 2: Missing only 1 or 2 ingredients */}
              <RecipeAccordion
                id="almost-ready"
                title="Almost Ready"
                accessibleTitle="Almost Ready"
                description="Missing 1 or 2 items. Close matches you can make with a quick substitute or a short grocery run."
                results={missingFew}
                isFavorite={(recipeId) => favorites.includes(recipeId)}
                onToggleFavorite={handleToggleFavorite}
                onSelectRecipe={setSelectedRecipeId}
                accent="blue"
              />

              {/* Category 3: Other possible matches */}
              {other.length > 0 && (
                <RecipeAccordion
                  id="other-possibilities"
                  title="Other Meal Possibilities"
                  accessibleTitle="Other Meal Possibilities"
                  description="Recipes matching some ingredients or suitable for future grocery planning."
                  results={other}
                  isFavorite={(recipeId) => favorites.includes(recipeId)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectRecipe={setSelectedRecipeId}
                  accent="stone"
                />
              )}

              {/* Zero results empty state */}
              {all.length === 0 && (
                <div className="p-10 rounded-3xl bg-white border border-stone-200 text-center max-w-lg mx-auto">
                  <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-stone-900">No recipes matched your active filters</h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Try relaxing your time or allergen exclusions, or clearing strict dietary options.
                  </p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Saved Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                  Your Saved Recipes
                </h2>
                <p className="text-sm text-stone-500">
                  Quick access to meals you love and have saved locally.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('discover')}
                className="text-xs sm:text-sm text-emerald-700 font-semibold hover:underline"
              >
                Back to discover
              </button>
            </div>

            {favoriteResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteResults.map((item) => (
                  <RecipeCard
                    key={item.recipe.id}
                    matchResult={item}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectRecipe={setSelectedRecipeId}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-md mx-auto">
                <Heart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-stone-900">No saved favorites yet</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Tap the heart icon on any recipe card to save it here for later.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Explore Recipes
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          userIngredients={ingredients}
          isFavorite={favorites.includes(selectedRecipe.id)}
          isCooked={cookedRecipes.includes(selectedRecipe.id)}
          onToggleFavorite={handleToggleFavorite}
          onMarkCooked={handleMarkCooked}
          onClose={handleCloseRecipe}
        />
      )}

      {/* App Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">What Should I Cook?</span>
            <span>•</span>
            <span>Zero waste, smart pantry cooking assistant</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
export default App;
