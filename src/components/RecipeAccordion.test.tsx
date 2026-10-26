// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RECIPES_DATA } from '../data/recipes';
import type { RecipeMatchResult } from '../types/recipe';
import { RecipeAccordion } from './RecipeAccordion';

const recipe = RECIPES_DATA.find((item) => item.id === 'garlic-butter-pasta');

if (!recipe) {
  throw new Error('Test recipe not found');
}

const results: RecipeMatchResult[] = [
  {
    recipe,
    matchPercentage: 75,
    matchedIngredients: ['Garlic'],
    missingIngredients: [],
    expiringIngredientsUsed: [],
    score: 75,
    category: 'other',
  },
];

afterEach(() => cleanup());

function renderAccordions() {
  return render(
    <>
      <RecipeAccordion
        id="almost-ready"
        title="Almost Ready"
        accessibleTitle="Almost Ready"
        description="Missing one or two ingredients."
        results={results}
        isFavorite={() => false}
        onToggleFavorite={() => undefined}
        onSelectRecipe={() => {}}
        accent="blue"
      />
      <RecipeAccordion
        id="other-possibilities"
        title="Other Meal Possibilities"
        accessibleTitle="Other Meal Possibilities"
        description="More recipes to try."
        results={[]}
        isFavorite={() => false}
        onToggleFavorite={() => undefined}
        onSelectRecipe={() => {}}
        accent="stone"
      />
    </>
  );
}

describe('RecipeAccordion', () => {
  it('starts collapsed and expands only the selected category', () => {
    renderAccordions();

    const almostReadyButton = screen.getByRole('button', {
      name: 'Expand Almost Ready recipes.',
    });
    const otherButton = screen.getByRole('button', {
      name: 'Expand Other Meal Possibilities recipes.',
    });

    expect(almostReadyButton).toHaveAttribute('aria-expanded', 'false');
    expect(otherButton).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('almost-ready-recipes')).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(almostReadyButton);

    expect(almostReadyButton).toHaveAttribute('aria-expanded', 'true');
    expect(otherButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('region', { name: 'Almost Ready — 1 recipe' })).toBeInTheDocument();
    expect(document.getElementById('other-possibilities-recipes')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Collapse Almost Ready recipes.' })).toHaveAttribute(
      'aria-controls',
      'almost-ready-recipes'
    );
  });

  it('shows only its own results and collapses when toggled again', () => {
    renderAccordions();

    fireEvent.click(screen.getByRole('button', { name: 'Expand Almost Ready recipes.' }));

    const panel = document.getElementById('almost-ready-recipes');
    if (!(panel instanceof HTMLElement)) {
      throw new Error('Almost Ready recipe panel not found');
    }
    expect(panel).not.toHaveAttribute('inert');
    within(panel).getByRole('button', {
      name: `View recipe: ${recipe.title}`,
    });
    expect(document.getElementById('other-possibilities-recipes')).toHaveTextContent(
      'No recipes in this category match your current filters.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Almost Ready recipes.' }));
    expect(screen.getByRole('button', { name: 'Expand Almost Ready recipes.' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(panel).toHaveAttribute('aria-hidden', 'true');
  });
});
