'use client';

import { useState } from 'react';
import Link from 'next/link';

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
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="aspect-[4/3] bg-light-grey flex items-center justify-center">
        <span className="text-secondary text-sm">No image yet</span>
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] relative bg-light-grey overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
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
}: RecipeCardProps) {
  const totalTime = prepTime + cookTime;

  return (
    <Link
      href={`/recipes/${cuisine.toLowerCase()}/${slug}`}
      className="group block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <RecipeImage src={heroImage} alt={title} />
      <div className="p-4">
        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-50 text-primary rounded-full capitalize">
          {cuisine}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
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
