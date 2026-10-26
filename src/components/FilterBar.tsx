import React from 'react';
import type { FilterState, MealType, Difficulty, Allergen } from '../types/recipe';
import { Filter, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onResetFilters: () => void;
}

const ALLERGEN_OPTIONS: { id: Allergen; label: string }[] = [
  { id: 'dairy', label: 'Dairy' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'nuts', label: 'Tree Nuts' },
  { id: 'soy', label: 'Soy' },
  { id: 'seafood', label: 'Fish & Seafood' },
  { id: 'sesame', label: 'Sesame' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const toggleAllergen = (allergen: Allergen) => {
    onFilterChange((prev) => {
      const exists = prev.excludedAllergens.includes(allergen);
      return {
        ...prev,
        excludedAllergens: exists
          ? prev.excludedAllergens.filter((a) => a !== allergen)
          : [...prev.excludedAllergens, allergen],
      };
    });
  };

  const hasActiveFilters =
    filters.mealType !== 'all' ||
    filters.maxTimeMinutes !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.sortBy !== 'best-match' ||
    filters.isVegetarian ||
    filters.isVegan ||
    filters.isGlutenFree ||
    filters.isDairyFree ||
    filters.budgetFriendlyOnly ||
    filters.excludedAllergens.length > 0;

  return (
    <section aria-labelledby="filter-heading" className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h2 id="filter-heading" className="text-base sm:text-lg font-bold text-stone-900">
            Refine & Dietary Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-stone-500 hover:text-stone-800 font-medium underline underline-offset-4 transition-colors"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meal Type */}
        <div>
          <label htmlFor="filter-meal-type" className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Meal Type
          </label>
          <select
            id="filter-meal-type"
            value={filters.mealType}
            onChange={(e) =>
              onFilterChange((prev) => ({
                ...prev,
                mealType: e.target.value as MealType | 'all',
              }))
            }
            className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="all">Any meal time</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>

        {/* Max Cooking Time */}
        <div>
          <label htmlFor="filter-time" className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Max Time
          </label>
          <select
            id="filter-time"
            value={filters.maxTimeMinutes}
            onChange={(e) =>
              onFilterChange((prev) => ({
                ...prev,
                maxTimeMinutes: e.target.value === 'all' ? 'all' : Number(e.target.value),
              }))
            }
            className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="all">Any duration</option>
            <option value="10">⚡ Under 10 minutes</option>
            <option value="15">⚡ Under 15 minutes</option>
            <option value="25">Under 25 minutes</option>
            <option value="35">Under 35 minutes</option>
            <option value="45">Under 45 minutes</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="filter-difficulty" className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Difficulty
          </label>
          <select
            id="filter-difficulty"
            value={filters.difficulty}
            onChange={(e) =>
              onFilterChange((prev) => ({
                ...prev,
                difficulty: e.target.value as Difficulty | 'all',
              }))
            }
            className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="all">Any difficulty</option>
            <option value="easy">Easy (Beginner friendly)</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="filter-sort" className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Sort Priority
          </label>
          <select
            id="filter-sort"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy'],
              }))
            }
            className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            <option value="best-match">Best overall match</option>
            <option value="least-missing">Fewest missing items</option>
            <option value="expiring-first">Prioritize expiring food</option>
            <option value="fastest">Fastest total time</option>
          </select>
        </div>
      </div>

      {/* Dietary preferences pills */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <span className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
          Dietary Needs & Budget
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'isVegetarian', label: '🌱 Vegetarian' },
            { key: 'isVegan', label: '🌿 Vegan' },
            { key: 'isGlutenFree', label: '🌾 Gluten-Free' },
            { key: 'isDairyFree', label: '🥛 Dairy-Free' },
          ].map(({ key, label }) => {
            const active = !!filters[key as keyof FilterState];
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onFilterChange((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof FilterState],
                  }))
                }
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                  active
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              onFilterChange((prev) => ({
                ...prev,
                budgetFriendlyOnly: !prev.budgetFriendlyOnly,
              }))
            }
            aria-pressed={filters.budgetFriendlyOnly}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1 ${
              filters.budgetFriendlyOnly
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Budget friendly ($)</span>
          </button>
        </div>
      </div>

      {/* Strict Allergen Exclusion */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Exclude Allergens (Strict Exclusion)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map(({ id, label }) => {
            const isExcluded = filters.excludedAllergens.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAllergen(id)}
                aria-pressed={isExcluded}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                  isExcluded
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs ring-1 ring-rose-200'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {isExcluded ? `✕ No ${label}` : `Exclude ${label}`}
              </button>
            );
          })}
        </div>

        {/* Required Medical / Informational Disclaimer */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50 flex items-start gap-2 text-[11px] sm:text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Allergy notice:</strong> Dietary & allergen filters are informational. Recipes are classified by typical preparation. Always verify packaged product labels, store brands, and cross-contamination risks before consumption.
          </p>
        </div>
      </div>
    </section>
  );
};
