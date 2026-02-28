'use client';

import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import RecipeCard from './RecipeCard';
import NoResultsCTA from './NoResultsCTA';
import RotatingPlaceholder from './RotatingPlaceholder';

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
  source?: 'curated' | 'community';
  qualityScore?: number;
  status?: 'pending' | 'featured' | 'rejected';
}

export default function SearchBar({ recipes }: { recipes: SearchItem[] }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query for showing no-results CTA (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

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
      <RotatingPlaceholder
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
      />

      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((recipe) => (
            <RecipeCard
              key={`${recipe.source || 'curated'}-${recipe.slug}`}
              {...recipe}
            />
          ))}
        </div>
      )}

      {debouncedQuery.length > 1 && results.length === 0 && (
        <NoResultsCTA searchQuery={debouncedQuery} />
      )}
    </div>
  );
}
