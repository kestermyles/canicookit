'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Bot } from 'lucide-react';
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
  photoIsAiGenerated?: boolean;
}

function RecipeImage({ src, alt, isAiGenerated }: { src: string; alt: string; isAiGenerated?: boolean }) {
  const [error, setError] = useState(false);

  // Show placeholder if no image or error loading
  if (!src || error) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-6 text-center">
        <Camera className="w-12 h-12 text-orange-300 mb-2" />
        <span className="text-secondary text-sm font-medium">No image yet</span>
        <span className="text-xs text-secondary/70 mt-1">
          Upload a photo of this dish
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-light-grey overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        onError={() => setError(true)}
      />
      {/* AI image badge overlay */}
      {isAiGenerated && (
        <div className="absolute top-2 right-2">
          <span className="px-3 py-1.5 bg-orange-500/95 backdrop-blur-sm text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-1.5">
            <Bot className="w-4 h-4" />
            AI image — be the first to upload yours!
          </span>
        </div>
      )}
    </div>
  );
}

function formatDifficulty(d: string): string {
  return d
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Simple star rating display for cards
function StarRatingDisplay({ slug }: { slug: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRating() {
      try {
        // Dynamically import to avoid SSR issues
        const { getRecipeRating } = await import('@/lib/supabase');
        const ratingData = await getRecipeRating(slug);

        if (ratingData.ratingCount > 0) {
          setRating(ratingData.averageRating);
          setCount(ratingData.ratingCount);
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRating();
  }, [slug]);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (rating === null) {
    return (
      <p className="text-xs text-gray-400 italic">Be the first to rate</p>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Star icons */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const partial = rating >= star - 0.5 && rating < star;

          return (
            <svg
              key={star}
              className="w-3.5 h-3.5"
              fill={filled || partial ? '#f97316' : 'none'}
              stroke="#f97316"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
        })}
      </div>
      {/* Rating number and count */}
      <span className="text-xs text-gray-600">
        <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
        <span className="text-gray-400 ml-1">({count})</span>
      </span>
    </div>
  );
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
  photoIsAiGenerated = false,
}: RecipeCardProps) {
  const totalTime = prepTime + cookTime;
  const isCommunity = source === 'community';
  const recipeUrl = isCommunity
    ? `/recipes/community/${slug}`
    : `/recipes/${cuisine.toLowerCase()}/${slug}`;

  // Show actual cuisine, or "Custom" if set to "generated"
  const displayCuisine = cuisine === 'generated' ? 'Custom' : cuisine;

  return (
    <Link
      href={recipeUrl}
      className="group block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
    >
      <RecipeImage src={heroImage} alt={title} isAiGenerated={photoIsAiGenerated} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-50 text-primary rounded-full capitalize">
            {displayCuisine}
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

        {/* Star rating display */}
        <div className="mt-1.5">
          <StarRatingDisplay slug={slug} />
        </div>

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
