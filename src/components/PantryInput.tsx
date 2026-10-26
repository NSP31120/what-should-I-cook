import React, { useState } from 'react';
import { Plus, X, Clock, Sparkles, AlertCircle } from 'lucide-react';
import type { UserIngredient } from '../types/recipe';
import { normalizeIngredient, COMMON_SUGGESTIONS } from '../utils/normalizer';
import { SpiceSeasonings } from './SpiceSeasonings';

interface PantryInputProps {
  ingredients: UserIngredient[];
  onAddIngredient: (name: string, expiresSoon?: boolean) => void;
  onRemoveIngredient: (id: string) => void;
  onToggleExpiresSoon: (id: string) => void;
  onClearAll: () => void;
}

export const PantryInput: React.FC<PantryInputProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onToggleExpiresSoon,
  onClearAll,
}) => {
  const [inputText, setInputText] = useState('');
  const [markAsExpiring, setMarkAsExpiring] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAdd = (nameToAdd?: string, forceExpiring?: boolean) => {
    const raw = (nameToAdd || inputText).trim();
    if (!raw) {
      setInputError('Please enter an ingredient name.');
      return;
    }

    if (raw.length < 2) {
      setInputError('Ingredient name must be at least 2 characters.');
      return;
    }

    const norm = normalizeIngredient(raw);
    const alreadyExists = ingredients.some(
      (ingredient) => normalizeIngredient(ingredient.normalizedName) === norm
    );
    if (alreadyExists) {
      setInputError(`"${raw}" is already in your pantry.`);
      return;
    }

    onAddIngredient(raw, forceExpiring !== undefined ? forceExpiring : markAsExpiring);
    setInputText('');
    setInputError(null);
    setMarkAsExpiring(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const expiringCount = ingredients.filter((i) => i.expiresSoon).length;

  return (
    <section aria-labelledby="pantry-heading" className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 id="pantry-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            What ingredients do you have?
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Add what is currently sitting in your fridge, freezer or pantry shelves.
          </p>
        </div>

        {ingredients.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-stone-500 hover:text-stone-800 font-medium underline underline-offset-4 self-start sm:self-auto transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-sm"
          >
            Clear all ({ingredients.length})
          </button>
        )}
      </div>

      {/* Input bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="ingredient-input" className="sr-only">
              Ingredient name
            </label>
            <input
              id="ingredient-input"
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Eggs, garlic, spinach, canned tomatoes..."
              className="w-full h-12 pl-4 pr-10 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-900 placeholder:text-stone-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 transition-all"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label="Clear input text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* "Use these first" expiring toggle */}
            <button
              type="button"
              onClick={() => setMarkAsExpiring(!markAsExpiring)}
              aria-pressed={markAsExpiring}
              className={`h-12 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                markAsExpiring
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
              title="Prioritizes recipes using this ingredient before it spoils"
            >
              <Clock className={`w-4 h-4 ${markAsExpiring ? 'text-amber-600' : 'text-stone-400'}`} />
              <span>Use first</span>
            </button>

            <button
              type="button"
              onClick={() => handleAdd()}
              className="h-12 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs shadow-emerald-700/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Validation error message */}
        {inputError && (
          <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* Added ingredient chips */}
      {ingredients.length > 0 ? (
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-stone-400">
              Your Pantry ({ingredients.length})
            </span>
            {expiringCount > 0 && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                {expiringCount} marked to use first
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className={`group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                  ing.expiresSoon
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs'
                    : 'bg-stone-100/80 border-stone-200 text-stone-800 hover:border-stone-300'
                }`}
              >
                <span>{ing.name}</span>

                {/* Expiry toggle indicator */}
                <button
                  type="button"
                  onClick={() => onToggleExpiresSoon(ing.id)}
                  title={ing.expiresSoon ? 'Expiring soon (click to unmark)' : 'Mark as expiring soon'}
                  className={`p-1 rounded-md transition-colors ${
                    ing.expiresSoon
                      ? 'text-amber-700 hover:bg-amber-100'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200'
                  }`}
                  aria-label={`Toggle expiring priority for ${ing.name}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(ing.id)}
                  className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label={`Remove ${ing.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs sm:text-sm text-stone-500">
          No ingredients added yet. Type an item above or pick popular choices below!
        </div>
      )}

      {/* Quick suggestions */}
      <div className="mt-6 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Tap Additions</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SUGGESTIONS.map((item) => {
            const norm = normalizeIngredient(item.name);
            const isAlreadyAdded = ingredients.some(
              (ingredient) => normalizeIngredient(ingredient.normalizedName) === norm
            );

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => !isAlreadyAdded && handleAdd(item.name)}
                disabled={isAlreadyAdded}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  isAlreadyAdded
                    ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-default opacity-60'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/30'
                }`}
              >
                <span>{item.name}</span>
                {!isAlreadyAdded && <Plus className="w-3 h-3 text-stone-400" />}
              </button>
            );
          })}
        </div>
        <SpiceSeasonings ingredients={ingredients} onAddIngredient={handleAdd} />
      </div>
    </section>
  );
};
