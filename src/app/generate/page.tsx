'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IngredientInput from '@/components/IngredientInput';
import EssentialsPanel from '@/components/EssentialsPanel';
import GeneratedRecipe from '@/components/GeneratedRecipe';
import { GeneratedRecipeData, PANTRY_ESSENTIALS } from '@/types/generator';
import { getAllCommunityRecipes } from '@/lib/supabase';

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);

  // Fetch recent community recipes
  useEffect(() => {
    async function fetchRecent() {
      try {
        const recipes = await getAllCommunityRecipes();
        setRecentRecipes(recipes.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent recipes:', error);
      }
    }
    fetchRecent();
  }, []);

  // Pre-fill ingredients from query param
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.trim()) {
      const ingredients = query
        .split(/[,;\s]+/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      if (ingredients.length > 0) {
        setUserIngredients(ingredients);
      }
    }
  }, [searchParams]);

  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (userIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedRecipe(null);

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIngredients,
          essentials: Array.from(PANTRY_ESSENTIALS),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate recipe');
      }

      setGeneratedRecipe(data.recipe);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedRecipe) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          save: true,
          recipe: generatedRecipe,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save recipe');
      }

      router.push(`/recipes/community/${data.slug}`);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save recipe. Please try again.');
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setGeneratedRecipe(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Dark Overlay */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/recipes/texas-chili-hero.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-white.png"
            alt="Can I Cook It?"
            className="h-20 mx-auto mb-4"
          />
          <p className="text-lg text-white/80">
            Tell us what you've got. We'll build something delicious.
          </p>
        </div>

        {/* Form Card */}
        {!generatedRecipe ? (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mb-12">
            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-3">What ingredients do you have?</h2>
                <IngredientInput
                  ingredients={userIngredients}
                  onChange={setUserIngredients}
                />
              </div>

              <EssentialsPanel />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Dismiss error"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || userIngredients.length === 0}
                className="px-8 py-4 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cooking up something delicious...
                  </span>
                ) : (
                  'Can I Cook It?'
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="mt-6">
                <p className="text-center text-secondary text-sm">
                  This usually takes 10-20 seconds...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mb-12">
            <GeneratedRecipe
              recipe={generatedRecipe}
              onSave={handleSave}
              isSaving={isSaving}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <button
                onClick={handleReset}
                className="px-6 py-2 text-primary hover:text-orange-700 font-medium transition-colors"
              >
                ← Generate another recipe
              </button>
            </div>
          </div>
        )}

        {/* See What Others Have Made Section */}
        {!generatedRecipe && recentRecipes.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              See what others have made
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recentRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/community/${recipe.slug}`}
                  className="group block bg-black/40 backdrop-blur rounded-lg p-4 hover:bg-black/50 transition-all border border-white/10"
                >
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-orange-200 transition-colors">
                    {recipe.title}
                  </h3>
                  <span className="inline-block px-2 py-0.5 text-xs bg-orange-500/80 text-white rounded-full capitalize">
                    {recipe.cuisine || 'Community'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
