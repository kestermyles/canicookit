'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommunityBadge from './CommunityBadge';

interface RecipeCardProps {
  title: string;
  slug: string;
  cuisine: string;
  description: string;
  heroImage: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  calories: number;
  source?: 'curated' | 'community';
  qualityScore?: number;
  status?: 'pending' | 'featured' | 'rejected';
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-48 bg-light-grey flex items-center justify-center">
        <span className="text-secondary text-sm">No image yet</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-light-grey overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

function formatDifficulty(d: string): string {
  return d
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function RecipeCard({
  title,
  slug,
  cuisine,
  description,
  heroImage,
  prepTime,
  cookTime,
  difficulty,
  calories,
  source = 'curated',
  qualityScore,
  status,
}: RecipeCardProps) {
  const totalTime = prepTime + cookTime;
  const isCommunity = source === 'community';
  const recipeUrl = isCommunity
    ? `/recipes/community/${slug}`
    : `/recipes/${cuisine.toLowerCase()}/${slug}`;

  return (
    <Link
      href={recipeUrl}
      className="group block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
    >
      <RecipeImage src={heroImage} alt={title} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-50 text-primary rounded-full capitalize">
            {cuisine}
          </span>
          {isCommunity && status && (
            <div className="scale-75 origin-left">
              <CommunityBadge status={status} qualityScore={qualityScore} />
            </div>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors font-display">
          {title}
        </h3>
        <p className="mt-1 text-sm text-secondary line-clamp-1">
          {description}
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="px-2 py-0.5 text-xs bg-light-grey text-secondary rounded-full">
            {totalTime} mins
          </span>
          <span className="px-2 py-0.5 text-xs bg-light-grey text-secondary rounded-full">
            {formatDifficulty(difficulty)}
          </span>
          <span className="px-2 py-0.5 text-xs bg-light-grey text-secondary rounded-full">
            {calories} cal
          </span>
        </div>
      </div>
    </Link>
  );
}
