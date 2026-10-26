// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type { UserIngredient } from '../types/recipe';
import { normalizeIngredient } from '../utils/normalizer';
import { SpiceSeasonings } from './SpiceSeasonings';

afterEach(() => cleanup());

function PantryHarness({ initialIngredients = [] }: { initialIngredients?: UserIngredient[] }) {
  const [ingredients, setIngredients] = useState(initialIngredients);

  return (
    <>
      <SpiceSeasonings
        ingredients={ingredients}
        onAddIngredient={(name) =>
          setIngredients((current) => [
            ...current,
            {
              id: name,
              name,
              normalizedName: normalizeIngredient(name),
            },
          ])
        }
      />
      <button
        type="button"
        onClick={() => setIngredients((current) => current.filter((item) => item.name !== 'pepper'))}
      >
        Remove pepper
      </button>
    </>
  );
}

describe('SpiceSeasonings', () => {
  it('expands and collapses each category and adds the requested spices', () => {
    const onAddIngredient = vi.fn();
    render(<SpiceSeasonings ingredients={[]} onAddIngredient={onAddIngredient} />);

    const essentialsToggle = screen.getByRole('button', { name: /essentials/i });
    const essentials = document.getElementById('spices-essentials');
    expect(essentialsToggle).toHaveAttribute('aria-expanded', 'false');
    expect(essentials).not.toBeVisible();

    fireEvent.click(essentialsToggle);
    expect(essentialsToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Black pepper' }));
    expect(onAddIngredient).toHaveBeenCalledWith('Black pepper');

    fireEvent.click(essentialsToggle);
    expect(essentialsToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters categories, reports no matches, and clears the search', () => {
    render(<SpiceSeasonings ingredients={[]} onAddIngredient={() => undefined} />);
    const search = screen.getByRole('searchbox', { name: 'Search spices, herbs, and seasonings' });

    fireEvent.change(search, { target: { value: 'white pepper' } });
    expect(screen.getByRole('button', { name: /essentials/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /herbs/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /essentials/i }));
    expect(screen.getByRole('button', { name: 'White pepper' })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'no-such-spice' } });
    expect(screen.getByRole('status')).toHaveTextContent('No spices or seasonings match');

    fireEvent.click(screen.getByRole('button', { name: 'Clear spice search' }));
    expect(search).toHaveValue('');
    expect(screen.getByRole('button', { name: /herbs/i })).toBeInTheDocument();
  });

  it('disables canonical aliases while selected and re-enables them when removed', () => {
    render(
      <PantryHarness
        initialIngredients={[
          { id: 'pepper', name: 'pepper', normalizedName: 'pepper' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /essentials/i }));
    const blackPepper = screen.getByRole('button', { name: 'Black pepper' });
    expect(blackPepper).toBeDisabled();
    expect(blackPepper).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Remove pepper' }));
    expect(screen.getByRole('button', { name: 'Black pepper' })).toBeEnabled();
  });

  it('includes all six requested groups and their 45 selectable items', () => {
    render(<SpiceSeasonings ingredients={[]} onAddIngredient={() => undefined} />);

    for (const category of [
      'Essentials',
      'Herbs',
      'Spices',
      'Seeds',
      'Blends and seasonings',
      'Sauces and flavourings',
    ]) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(category, 'i') }));
    }

    const panels = [
      'spices-essentials',
      'spices-herbs',
      'spices-spices',
      'spices-seeds',
      'spices-blends-and-seasonings',
      'spices-sauces-and-flavourings',
    ];
    const itemCount = panels.reduce((count, id) => {
      const panel = document.getElementById(id);
      if (!panel) throw new Error(`Missing spice category panel: ${id}`);
      return count + within(panel).getAllByRole('button').length;
    }, 0);

    expect(itemCount).toBe(45);

    for (const [category, id] of [
      ['Essentials', 'spices-essentials'],
      ['Herbs', 'spices-herbs'],
      ['Spices', 'spices-spices'],
      ['Seeds', 'spices-seeds'],
      ['Blends and seasonings', 'spices-blends-and-seasonings'],
      ['Sauces and flavourings', 'spices-sauces-and-flavourings'],
    ]) {
      const panel = document.getElementById(id);
      const toggle = panel?.previousElementSibling?.querySelector('button');
      if (!panel || !toggle) throw new Error(`Missing spice category toggle: ${category}`);
      fireEvent.click(toggle);
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
