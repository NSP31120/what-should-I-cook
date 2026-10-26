import React from 'react';
import type { RecipeMatchResult } from '../types/recipe';
import { Clock, ChefHat, Heart, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { RecipeImage } from './RecipeImage';

interface RecipeCardProps {
  matchResult: RecipeMatchResult;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  matchResult,
  isFavorite,
  onToggleFavorite,
  onSelectRecipe,
}) => {
  const { recipe, matchPercentage, matchedIngredients, missingIngredients, expiringIngredientsUsed } =
    matchResult;
  const isComplete = missingIngredients.length === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-emerald-500/50 hover:shadow-lg">
      <button
        type="button"
        onClick={() => onSelectRecipe(recipe.id)}
        aria-label={`View recipe: ${recipe.title}`}
        className="flex h-full w-full flex-col text-left active:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
      >
        <RecipeImage
          recipeId={recipe.id}
          alt={`${recipe.title}, plated and ready to serve`}
          className="aspect-[16/10] w-full"
        />

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold tracking-tight ${
                  isComplete
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : missingIngredients.length <= 2
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : 'border-stone-200 bg-stone-100 text-stone-700'
                }`}
              >
                {isComplete && <Check className="h-3 w-3 text-emerald-600" />}
                {matchPercentage}% Match
              </span>

              {expiringIngredientsUsed.length > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  Uses {expiringIngredientsUsed.length} expiring
                </span>
              )}

              {recipe.budgetFriendly && (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                  Budget $
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-stone-900 transition-colors group-hover:text-emerald-700 sm:text-xl">
            {recipe.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500 sm:text-sm">
            {recipe.description}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-100 pt-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              Prep {recipe.prepTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              Cook {recipe.cookTimeMinutes} min
            </span>
            <span className="flex items-center gap-1 capitalize">
              <ChefHat className="h-3.5 w-3.5 text-stone-400" />
              {recipe.difficulty}
            </span>
            <span className="capitalize">{recipe.mealType}</span>
          </div>

          <div className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-xs">
            {matchedIngredients.length > 0 && (
              <div className="flex items-start gap-1.5 text-stone-600">
                <span className="shrink-0 font-semibold text-emerald-700">Have:</span>
                <span className="line-clamp-1">{matchedIngredients.join(', ')}</span>
              </div>
            )}

            {missingIngredients.length > 0 ? (
              <div className="flex items-start gap-1.5 text-stone-600">
                <span className="flex shrink-0 items-center gap-1 font-semibold text-amber-700">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  Need ({missingIngredients.length}):
                </span>
                <span className="line-clamp-1">
                  {missingIngredients.map((ingredient) => ingredient.name).join(', ')}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                You have all ingredients! Ready to cook.
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.dietary.isVegetarian && (
              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                Vegetarian
              </span>
            )}
            {recipe.dietary.isVegan && (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                Vegan
              </span>
            )}
            {recipe.dietary.isGlutenFree && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                Gluten-Free
              </span>
            )}
            {recipe.dietary.isDairyFree && (
              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                Dairy-Free
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-5 py-3 text-xs font-semibold text-emerald-700 transition-colors group-hover:bg-emerald-50/50 group-active:bg-emerald-100 sm:px-6">
          <span>View Recipe</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(recipe.id)}
        className={`absolute right-3 top-3 rounded-full p-3.5 shadow-sm transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
          isFavorite
            ? 'bg-rose-50 text-rose-600'
            : 'bg-white/95 text-stone-500 hover:bg-white hover:text-stone-900'
        }`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
      </button>
    </article>
  );
};
