'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import RecipeCard from './RecipeCard';

interface SearchItem {
  title: string;
  slug: string;
  cuisine: string;
  description: string;
  ingredients: string[];
  tags: string[];
  heroImage: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  calories: number;
}

export default function SearchBar({ recipes }: { recipes: SearchItem[] }) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(recipes, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'description', weight: 1 },
          { name: 'ingredients', weight: 1.5 },
          { name: 'tags', weight: 1.5 },
          { name: 'cuisine', weight: 1 },
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    [recipes]
  );

  const results =
    query.length > 1 ? fuse.search(query).map((r) => r.item) : [];

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search recipes by name, ingredient, cuisine..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground text-xl"
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((recipe) => (
            <RecipeCard
              key={`${recipe.cuisine}-${recipe.slug}`}
              {...recipe}
            />
          ))}
        </div>
      )}

      {query.length > 1 && results.length === 0 && (
        <p className="mt-6 text-center text-secondary">
          No recipes found for &ldquo;{query}&rdquo;. Try a different search
          term.
        </p>
      )}
    </div>
  );
}
