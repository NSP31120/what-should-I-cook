import React from 'react';
import { Sparkles, ArrowDown, Leaf, PiggyBank, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  pantryCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, pantryCount }) => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 text-center">
      {/* Subtle background ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Zero Food Waste & Kitchen Money-Saver</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight sm:leading-none">
          Turn what you have into <br className="hidden sm:inline" />
          <span className="text-emerald-700">something delicious.</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Stop wondering what to make or letting groceries expire. Add the ingredients in your fridge or pantry, and discover appetizing dishes you can prepare right now.
        </p>

        {/* 3 mini feature badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-stone-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Reduces food waste</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>Saves grocery expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>No account required</span>
          </div>
        </div>

        {/* Call to action anchor if pantry is empty */}
        {pantryCount === 0 && (
          <div className="mt-8">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-stone-900 text-white hover:bg-stone-800 text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Start by adding ingredients</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
