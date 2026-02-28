'use client';

import { useState, useEffect } from 'react';

interface StarRatingProps {
  recipeSlug: string;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export default function StarRating({
  recipeSlug,
  size = 'medium',
  showCount = true
}: StarRatingProps) {
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  useEffect(() => {
    async function loadRatings() {
      try {
        // Load user's rating from localStorage for anonymous users
        const storedRating = localStorage.getItem(`rating-${recipeSlug}`);
        if (storedRating) {
          setUserRating(parseInt(storedRating));
        }

        // Fetch actual ratings from Supabase
        const { getRecipeRating } = await import('@/lib/supabase');
        const ratingData = await getRecipeRating(recipeSlug);

        setRating(ratingData.averageRating);
        setTotalRatings(ratingData.ratingCount);
      } catch (error) {
        console.error('Error loading ratings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRatings();
  }, [recipeSlug]);

  const handleRate = async (stars: number) => {
    setUserRating(stars);

    // Submit rating to Supabase
    try {
      const { submitRating } = await import('@/lib/supabase');
      await submitRating(recipeSlug, stars);

      // Refresh ratings to show updated average
      const { getRecipeRating } = await import('@/lib/supabase');
      const ratingData = await getRecipeRating(recipeSlug);
      setRating(ratingData.averageRating);
      setTotalRatings(ratingData.ratingCount);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className={`${sizes[size]} bg-gray-200 rounded animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Star Display */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = (hoverRating || userRating || rating) >= star;
            const partialFill = !hoverRating && !userRating && rating >= star - 0.5 && rating < star;

            return (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <svg
                  className={`${sizes[size]} transition-colors`}
                  fill={filled || partialFill ? '#f97316' : 'none'}
                  stroke="#f97316"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {partialFill ? (
                    <>
                      <defs>
                        <linearGradient id={`half-${star}`}>
                          <stop offset="50%" stopColor="#f97316" />
                          <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={`url(#half-${star})`}
                      />
                    </>
                  ) : (
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  )}
                </svg>
              </button>
            );
          })}
        </div>

        {showCount && (
          <div className={`${textSizes[size]} text-gray-600 font-medium`}>
            <span className="text-foreground font-bold">{rating.toFixed(1)}</span>
            <span className="text-secondary ml-1">({totalRatings.toLocaleString()})</span>
          </div>
        )}
      </div>

      {/* User feedback */}
      {userRating > 0 && (
        <p className="text-sm text-green-600">
          ✓ You rated this {userRating} {userRating === 1 ? 'star' : 'stars'}
        </p>
      )}
    </div>
  );
}
