import React from 'react';
import { ChefHat, Heart, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onResetAll: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  activeTab: 'discover' | 'favorites' | 'pantry';
  onSelectTab: (tab: 'discover' | 'favorites' | 'pantry') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetAll,
  favoritesCount,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <button
          onClick={() => onSelectTab('discover')}
          className="flex items-center gap-2.5 text-stone-900 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg p-1 text-left"
          aria-label="What Should I Cook? Homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-base sm:text-lg tracking-tight block leading-tight">
              What Should I Cook?
            </span>
            <span className="text-[11px] text-stone-500 font-medium tracking-wide uppercase hidden sm:block">
              Zero Waste Recipe Finder
            </span>
          </div>
        </button>

        {/* Center / Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'discover'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Discover
            </span>
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'favorites'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
            aria-label={`Saved favorites (${favoritesCount})`}
          >
            <span className="flex items-center gap-1.5">
              <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              Favorites
              {favoritesCount > 0 && (
                <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-stone-100 text-stone-800 font-bold rounded-full group-hover:bg-white">
                  {favoritesCount}
                </span>
              )}
            </span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetAll}
            title="Reset ingredients and filters"
            className="p-2 ml-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            aria-label="Reset pantry and filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </nav>

      </div>
    </header>
  );
};
