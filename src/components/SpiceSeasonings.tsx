import { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import type { UserIngredient } from '../types/recipe';
import { normalizeIngredient } from '../utils/normalizer';

interface SpiceSeasoningsProps {
  ingredients: UserIngredient[];
  onAddIngredient: (name: string) => void;
}

const SPICE_CATEGORIES = [
  {
    name: 'Essentials',
    items: ['Salt', 'Black pepper', 'White pepper', 'Garlic powder', 'Onion powder'],
  },
  {
    name: 'Herbs',
    items: ['Basil', 'Oregano', 'Thyme', 'Rosemary', 'Parsley', 'Cilantro', 'Dill', 'Mint', 'Sage'],
  },
  {
    name: 'Spices',
    items: [
      'Paprika',
      'Smoked paprika',
      'Cumin',
      'Coriander',
      'Turmeric',
      'Cinnamon',
      'Nutmeg',
      'Cloves',
      'Ginger',
      'Cardamom',
      'Cayenne',
      'Chili powder',
    ],
  },
  {
    name: 'Seeds',
    items: ['Mustard seeds', 'Fennel seeds', 'Cumin seeds', 'Sesame seeds', 'Caraway seeds'],
  },
  {
    name: 'Blends and seasonings',
    items: [
      'Curry powder',
      'Garam masala',
      'Italian seasoning',
      'Taco seasoning',
      'Cajun seasoning',
      "Za'atar",
      'Chinese five-spice',
      'Herbes de Provence',
    ],
  },
  {
    name: 'Sauces and flavourings',
    items: ['Soy sauce', 'Vinegar', 'Hot sauce', 'Worcestershire sauce', 'Vanilla', 'Lemon juice'],
  },
] as const;

export function SpiceSeasonings({ ingredients, onAddIngredient }: SpiceSeasoningsProps) {
  const [searchText, setSearchText] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const query = searchText.trim().toLowerCase();

  const filteredCategories = useMemo(
    () =>
      SPICE_CATEGORIES.map((category) => ({
        ...category,
        items: category.items.filter((item) => item.toLowerCase().includes(query)),
      })).filter((category) => category.items.length > 0),
    [query]
  );

  const pantryNames = useMemo(
    () => new Set(ingredients.map((ingredient) => normalizeIngredient(ingredient.normalizedName))),
    [ingredients]
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((expanded) =>
      expanded.includes(categoryName)
        ? expanded.filter((name) => name !== categoryName)
        : [...expanded, categoryName]
    );
  };

  return (
    <section
      aria-labelledby="spices-heading"
      className="mt-6 border-t border-stone-100 pt-4"
    >
      <h3 id="spices-heading" className="text-sm font-bold text-stone-800">
        Spices, Herbs &amp; Seasonings
      </h3>
      <p className="mt-1 text-xs text-stone-500">
        Search and expand a category to add kitchen staples to your pantry.
      </p>

      <div className="relative mt-3">
        <label htmlFor="spice-search" className="sr-only">
          Search spices, herbs, and seasonings
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        />
        <input
          id="spice-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search herbs, spices, sauces..."
          className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/80"
        />
        {searchText && (
          <button
            type="button"
            aria-label="Clear spice search"
            onClick={() => setSearchText('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {filteredCategories.map((category) => {
          const expanded = expandedCategories.includes(category.name);
          const panelId = `spices-${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

          return (
            <div key={category.name} className="overflow-hidden rounded-xl border border-stone-200">
              <h4 className="m-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => toggleCategory(category.name)}
                  className="flex w-full items-center justify-between gap-3 bg-stone-50 px-3 py-2.5 text-left text-xs font-semibold text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                >
                  <span>{category.name}</span>
                  <span className="flex items-center gap-2 text-stone-400">
                    <span>{category.items.length}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
              </h4>
              <div
                id={panelId}
                aria-hidden={!expanded}
                hidden={!expanded}
                className="flex flex-wrap gap-1.5 p-2.5"
              >
                {category.items.map((item) => {
                  const selected = pantryNames.has(normalizeIngredient(item));

                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={selected}
                      aria-pressed={selected}
                      onClick={() => onAddIngredient(item)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                        selected
                          ? 'cursor-default border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800'
                      }`}
                    >
                      <span>{item}</span>
                      {selected ? (
                        <Check aria-hidden="true" className="h-3 w-3" />
                      ) : (
                        <Plus aria-hidden="true" className="h-3 w-3 text-stone-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filteredCategories.length === 0 && (
          <p role="status" className="rounded-xl bg-stone-50 px-3 py-4 text-center text-xs text-stone-500">
            No spices or seasonings match “{searchText}”.
          </p>
        )}
      </div>
    </section>
  );
}
