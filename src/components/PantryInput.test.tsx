// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useState } from 'react';
import type { UserIngredient } from '../types/recipe';
import { COMMON_SUGGESTIONS, normalizeIngredient } from '../utils/normalizer';
import { PantryInput } from './PantryInput';

afterEach(() => cleanup());

function PantryHarness() {
  const [ingredients, setIngredients] = useState<UserIngredient[]>([]);

  return (
    <PantryInput
      ingredients={ingredients}
      onAddIngredient={(name, expiresSoon = false) => {
        const normalizedName = normalizeIngredient(name);
        setIngredients((current) =>
          current.some((item) => item.normalizedName === normalizedName)
            ? current
            : [
                ...current,
                {
                  id: normalizedName,
                  name,
                  normalizedName,
                  expiresSoon,
                },
              ]
        );
      }}
      onRemoveIngredient={(id) =>
        setIngredients((current) => current.filter((item) => item.id !== id))
      }
      onToggleExpiresSoon={(id) =>
        setIngredients((current) =>
          current.map((item) =>
            item.id === id ? { ...item, expiresSoon: !item.expiresSoon } : item
          )
        )
      }
      onClearAll={() => setIngredients([])}
    />
  );
}

describe('PantryInput', () => {
  it('validates empty and too-short input, adds on Enter, and rejects canonical duplicates', () => {
    render(<PantryHarness />);
    const input = screen.getByRole('textbox', { name: 'Ingredient name' });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter an ingredient name.');

    fireEvent.change(input, { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('alert')).toHaveTextContent('at least 2 characters');

    fireEvent.change(input, { target: { value: 'temporary text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear input text' }));
    expect(input).toHaveValue('');

    fireEvent.change(input, { target: { value: 'pepper' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('pepper')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Black pepper' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('alert')).toHaveTextContent('already in your pantry');
    expect(screen.getByText('Your Pantry (1)')).toBeInTheDocument();
  });

  it('adds every quick suggestion once, marks items to use first, and clears the pantry', () => {
    render(<PantryHarness />);

    const useFirst = screen.getByRole('button', { name: 'Use first' });
    fireEvent.click(useFirst);
    expect(useFirst).toHaveAttribute('aria-pressed', 'true');

    fireEvent.change(screen.getByRole('textbox', { name: 'Ingredient name' }), {
      target: { value: 'Spinach' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('1 marked to use first')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle expiring priority for Spinach' }));
    expect(screen.queryByText(/marked to use first/)).not.toBeInTheDocument();

    for (const suggestion of COMMON_SUGGESTIONS) {
      const suggestionButton = screen.getByRole('button', { name: suggestion.name });
      if (!suggestionButton.hasAttribute('disabled')) fireEvent.click(suggestionButton);
    }

    expect(screen.getByText(`Your Pantry (${COMMON_SUGGESTIONS.length})`)).toBeInTheDocument();
    for (const suggestion of COMMON_SUGGESTIONS) {
      expect(screen.getByRole('button', { name: suggestion.name })).toBeDisabled();
    }

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(screen.getByText(/No ingredients added yet/)).toBeInTheDocument();
  });

  it('allows quick-add ingredients to be removed and selected again', () => {
    render(<PantryHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Eggs' }));
    const pantry = screen.getByText('Your Pantry (1)').parentElement?.parentElement;
    if (!pantry) throw new Error('Pantry section not found');
    fireEvent.click(within(pantry).getByRole('button', { name: 'Remove Eggs' }));

    expect(screen.getByRole('button', { name: 'Eggs' })).toBeEnabled();
  });
});
