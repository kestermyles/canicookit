'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import RecipeCard from './RecipeCard';
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

      {query.length > 1 && results.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-3">No recipes found — want to create one?</p>
          <Link
            href={`/generate?q=${encodeURIComponent(query)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors font-medium text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Build a recipe
          </Link>
        </div>
      )}
    </div>
  );
}
