import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { RecipeMatchResult } from '../types/recipe';
import { RecipeCard } from './RecipeCard';

interface RecipeAccordionProps {
  id: string;
  title: string;
  accessibleTitle: string;
  description: string;
  results: RecipeMatchResult[];
  isFavorite: (recipeId: string) => boolean;
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
  accent: 'blue' | 'stone';
}

export function RecipeAccordion({
  id,
  title,
  accessibleTitle,
  description,
  results,
  isFavorite,
  onToggleFavorite,
  onSelectRecipe,
  accent,
}: RecipeAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const headingId = `${id}-heading`;
  const panelId = `${id}-recipes`;
  const accentClasses =
    accent === 'blue'
      ? 'bg-blue-100 text-blue-800 group-hover:bg-blue-200'
      : 'bg-stone-100 text-stone-700 group-hover:bg-stone-200';

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="m-0">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${accessibleTitle} recipes.`}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="group flex w-full items-center justify-between gap-3 rounded-xl py-2 text-left transition-colors hover:bg-white/70 active:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${accentClasses}`}
            >
              {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </span>
            <span className="min-w-0 text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
              {title} — {results.length} {results.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </span>
        </button>
      </h2>

      <p className="mt-1 pl-11 text-xs text-stone-500 sm:text-sm">{description}</p>

      <div
        id={panelId}
        aria-labelledby={headingId}
        aria-hidden={!isExpanded}
        inert={!isExpanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          isExpanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <RecipeCard
                  key={item.recipe.id}
                  matchResult={item}
                  isFavorite={isFavorite(item.recipe.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectRecipe={onSelectRecipe}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 text-center text-sm text-stone-500">
              No recipes in this category match your current filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
