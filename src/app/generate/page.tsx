'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRef } from 'react';
import IngredientInput, { IngredientInputHandle } from '@/components/IngredientInput';
import EssentialsPanel from '@/components/EssentialsPanel';
import GeneratedRecipe from '@/components/GeneratedRecipe';
import AuthModal from '@/components/AuthModal';
import { StylizedCamera } from '@/components/NoPhotoPlaceholder';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedRecipeData, PANTRY_ESSENTIALS } from '@/types/generator';
import { getAllCommunityRecipes } from '@/lib/supabase';

// Force dynamic rendering for this page (uses searchParams)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const PANTRY_CATEGORIES = [
  { label: 'Fats & Oils', items: ['olive oil', 'vegetable oil', 'butter'] },
  { label: 'Seasoning', items: ['salt', 'black pepper'] },
  { label: 'Aromatics', items: ['garlic', 'onion'] },
  { label: 'Acids', items: ['lemon juice', 'white wine vinegar', 'red wine vinegar'] },
  { label: 'Sweeteners', items: ['sugar', 'honey'] },
  { label: 'Dry Goods', items: ['plain flour', 'rice', 'pasta'] },
  { label: 'Eggs & Dairy', items: ['eggs', 'milk'] },
  { label: 'Tinned & Jarred', items: ['tinned tomatoes', 'tomato paste', 'tinned beans', 'tinned coconut milk', 'stock cubes'] },
  { label: 'Condiments & Sauces', items: ['dijon mustard', 'worcestershire sauce', 'hot sauce', 'soy sauce'] },
  { label: 'Spices', items: ['smoked paprika', 'cumin', 'ground coriander', 'cinnamon', 'chilli flakes', 'garlic powder'] },
  { label: 'Dried Herbs', items: ['dried oregano', 'dried thyme', 'bay leaves', 'dried mixed herbs'] },
];

function PreferencesPanel({
  cookingMethod,
  setCookingMethod,
  cuisinePreference,
  setCuisinePreference,
  mealVibe,
  setMealVibe,
  extraPreferences,
  setExtraPreferences,
  forceOpen = false,
}: {
  cookingMethod: string | null;
  setCookingMethod: (v: string | null) => void;
  cuisinePreference: string | null;
  setCuisinePreference: (v: string | null) => void;
  mealVibe: string | null;
  setMealVibe: (v: string | null) => void;
  extraPreferences: string;
  setExtraPreferences: (v: string) => void;
  forceOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(forceOpen);

  // Auto-open on desktop (skip if forceOpen)
  useEffect(() => {
    if (!forceOpen && window.innerWidth >= 640) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const hasSelection = cookingMethod || cuisinePreference || mealVibe;

  return (
    <div className="border-t border-gray-100 pt-3 sm:pt-5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <p className="text-sm text-secondary">
          Any preferences?{' '}
          {hasSelection ? (
            <span className="text-primary font-medium">
              {[cookingMethod, cuisinePreference, mealVibe].filter(Boolean).join(', ')}
            </span>
          ) : (
            <span className="text-gray-400">(optional)</span>
          )}
        </p>
        <svg
          className={`w-4 h-4 text-secondary transition-transform sm:hidden ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="space-y-4 mt-3">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Cooking method</p>
            <div className="flex flex-wrap gap-2">
              {['Fried', 'Baked', 'Poached', 'Steamed', 'Grilled', 'Raw'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setCookingMethod(cookingMethod === method ? null : method)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    cookingMethod === method
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-orange-300 hover:border-primary'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Cuisine style</p>
            <div className="flex flex-wrap gap-2">
              {['Italian', 'Asian', 'Mexican', 'British', 'American', 'Indian', 'French'].map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => setCuisinePreference(cuisinePreference === cuisine ? null : cuisine)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    cuisinePreference === cuisine
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-orange-300 hover:border-primary'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Meal vibe</p>
            <div className="flex flex-wrap gap-2">
              {['Light', 'Hearty', 'Quick', 'Comfort food', 'Healthy'].map((vibe) => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => setMealVibe(mealVibe === vibe ? null : vibe)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    mealVibe === vibe
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-orange-300 hover:border-primary'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Anything else?</p>
            <input
              type="text"
              value={extraPreferences}
              onChange={(e) => setExtraPreferences(e.target.value)}
              placeholder="e.g. no nuts, extra spicy, make it filling..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
        // Deduplicate by normalised title, keeping first occurrence (most recent)
        const seenTitles = new Set<string>();
        const deduped = recipes.filter((r: any) => {
          const key = r.title?.toLowerCase().trim() ?? '';
          if (seenTitles.has(key)) return false;
          seenTitles.add(key);
          return true;
        });
        setRecentRecipes(deduped.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent recipes:', error);
      }
    }
    fetchRecent();
  }, []);

  // Pre-fill ingredients from query params (q, dish, or ingredients)
  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('dish') || searchParams.get('ingredients');
    if (query && query.trim()) {
      const ingredients = query
        .split(/[,;]+/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      if (ingredients.length > 0) {
        setUserIngredients(ingredients);
      }
    }
  }, [searchParams]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Highlight camera button if navigated with ?scan=true
  const cameraButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (searchParams.get('scan') === 'true') {
      setHighlightCamera(true);
      setTimeout(() => {
        cameraButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams]);
  const ingredientInputRef = useRef<IngredientInputHandle>(null);
  const [pendingInputText, setPendingInputText] = useState('');
  const [recentGenerated, setRecentGenerated] = useState<GeneratedRecipeData[]>([]);

  // Load recent generated recipes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentGeneratedRecipes');
      if (stored) {
        setRecentGenerated(JSON.parse(stored));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [cookingMethod, setCookingMethod] = useState<string | null>(null);
  const [cuisinePreference, setCuisinePreference] = useState<string | null>(null);
  const [mealVibe, setMealVibe] = useState<string | null>(null);
  const [extraPreferences, setExtraPreferences] = useState('');
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [highlightCamera, setHighlightCamera] = useState(false);
  const { user } = useAuth();

  const handleGenerate = async () => {
    // Flush any pending text in the input before generating
    const flushed = ingredientInputRef.current?.flush();

    // Build the full ingredients list including any just-flushed value
    // (React state update from flush is async, so userIngredients may not include it yet)
    const ingredientsToSend = flushed && !userIngredients.includes(flushed)
      ? [...userIngredients, flushed]
      : [...userIngredients];

    if (ingredientsToSend.length === 0) {
      setError('Please add at least one ingredient or dish name');
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
          userIngredients: ingredientsToSend,
          essentials: Array.from(PANTRY_ESSENTIALS),
          ...(cookingMethod && { cookingMethod }),
          ...(cuisinePreference && { cuisinePreference }),
          ...(mealVibe && { mealVibe }),
          ...(extraPreferences.trim() && { extraPreferences: extraPreferences.trim() }),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create recipe');
      }

      setGeneratedRecipe(data.recipe);

      // Save to recent recipes in localStorage (keep last 5)
      try {
        const stored = localStorage.getItem('recentGeneratedRecipes');
        const existing: GeneratedRecipeData[] = stored ? JSON.parse(stored) : [];
        const updated = [data.recipe, ...existing].slice(0, 5);
        localStorage.setItem('recentGeneratedRecipes', JSON.stringify(updated));
        setRecentGenerated(updated);
      } catch {
        // ignore localStorage errors
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create recipe. Please try again.');
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

      if (user) {
        router.push(`/recipes/community/${data.slug}`);
      } else {
        setSavedSlug(data.slug);
        setIsSaving(false);
      }
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

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setScanError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/scan-ingredients', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to scan ingredients');
      }

      if (data.ingredients.length === 0) {
        setScanError("Couldn't spot any ingredients — try a clearer photo");
        return;
      }

      // Merge with existing ingredients, deduplicating
      setUserIngredients((prev) => {
        const existing = new Set(prev.map((i) => i.toLowerCase()));
        const newIngredients = data.ingredients.filter(
          (i: string) => !existing.has(i.toLowerCase())
        );
        return [...prev, ...newIngredients];
      });
    } catch (err) {
      console.error('Scan error:', err);
      setScanError(err instanceof Error ? err.message : 'Failed to scan ingredients');
    } finally {
      setIsScanning(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden max-w-[100vw]">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/recipes/texas-chili-hero.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-12">
        {/* Logo and Tagline */}
        <div className="text-center mb-4 sm:mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-color.svg"
            alt="Can I Cook It"
            style={{ height: '80px', width: 'auto' }}
            className="mx-auto mb-4 mix-blend-darken hidden sm:block"
          />
          <p className="text-base sm:text-lg text-white/80">
            Tell us what&apos;s in your fridge. We&apos;ll do the rest.
          </p>
          <p className="text-sm text-white/60 mt-2 hidden sm:block">
            Share a photo of your finished dish — the best ones get featured!
          </p>
        </div>

        {/* Form Card */}
        {!generatedRecipe ? (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-5 py-4 sm:p-8 max-w-2xl mx-1 sm:mx-auto mb-12 overflow-hidden">
            <div className="space-y-3 sm:space-y-6">
              {/* Scan ingredients — compact on mobile, prominent on desktop */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <h2 className="text-lg sm:text-xl font-semibold">What ingredients do you have?</h2>
                  <button
                    type="button"
                    onClick={() => setShowPantryModal(true)}
                    className="px-2.5 py-1 text-xs bg-orange-50 border border-orange-200 rounded-full text-orange-700 hover:bg-orange-100 transition-colors flex-shrink-0"
                  >
                    🧂 Pantry
                  </button>
                </div>
                <button
                  ref={cameraButtonRef}
                  type="button"
                  onClick={() => { setHighlightCamera(false); fileInputRef.current?.click(); }}
                  disabled={isScanning}
                  className={`w-full bg-orange-50 border-2 border-orange-300 rounded-xl p-3 sm:p-6 flex flex-row sm:flex-col items-center gap-2 sm:gap-2 cursor-pointer hover:border-primary hover:bg-orange-100/70 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${highlightCamera ? 'ring-2 ring-primary ring-offset-2 animate-pulse' : ''}`}
                >
                  {isScanning ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 sm:h-8 sm:w-8 text-primary flex-shrink-0"
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
                      <span className="text-sm font-medium text-primary">Identifying ingredients...</span>
                    </>
                  ) : (
                    <>
                      <StylizedCamera size={28} />
                      <div className="sm:text-center">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">Show us what you&apos;ve got</span>
                        <span className="text-sm text-gray-500 hidden sm:block mt-1">Take a photo of your fridge or ingredients</span>
                      </div>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleScan(file);
                  }}
                />
                {scanError && (
                  <p className="mt-2 text-sm text-red-600">{scanError}</p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">or type them in</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Text ingredient input */}
              <div>
                <IngredientInput
                  ref={ingredientInputRef}
                  ingredients={userIngredients}
                  onChange={setUserIngredients}
                  onInputChange={setPendingInputText}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                      aria-label="Dismiss error"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

              {/* Surprise Me / Let Me Choose dual-card UX */}
              {(userIngredients.length > 0 || pendingInputText.trim() !== '') && (
                <div className="pt-1 sm:pt-2">
                  {isGenerating ? (
                    <div className="text-center py-4">
                      <span className="flex items-center justify-center gap-3 text-primary font-semibold text-base sm:text-lg">
                        <svg
                          className="animate-spin h-5 w-5 sm:h-6 sm:w-6"
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
                      <p className="text-secondary text-sm mt-2">
                        This usually takes 10-20 seconds...
                      </p>
                    </div>
                  ) : !showPreferences ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex flex-col items-center gap-1.5 p-4 sm:p-5 bg-primary text-white rounded-xl shadow-md hover:bg-orange-700 transition-colors"
                      >
                        <span className="text-2xl">🎲</span>
                        <span className="font-semibold text-base">Surprise Me</span>
                        <span className="text-sm opacity-80">Just make something delicious</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPreferences(true)}
                        className="flex flex-col items-center gap-1.5 p-4 sm:p-5 bg-white border-2 border-orange-300 text-gray-800 rounded-xl shadow-md hover:border-primary transition-colors"
                      >
                        <span className="text-2xl">⚙️</span>
                        <span className="font-semibold text-base">Let Me Choose</span>
                        <span className="text-sm text-gray-500">Pick your style first</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">Your preferences</p>
                        <button
                          type="button"
                          onClick={() => setShowPreferences(false)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          ← Back
                        </button>
                      </div>
                      <PreferencesPanel
                        cookingMethod={cookingMethod}
                        setCookingMethod={setCookingMethod}
                        cuisinePreference={cuisinePreference}
                        setCuisinePreference={setCuisinePreference}
                        mealVibe={mealVibe}
                        setMealVibe={setMealVibe}
                        extraPreferences={extraPreferences}
                        setExtraPreferences={setExtraPreferences}
                        forceOpen
                      />
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={handleGenerate}
                          className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors font-semibold text-base sm:text-lg shadow-md hover:shadow-lg"
                        >
                          Can I Cook It?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible extras below the CTA */}
              <EssentialsPanel />
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mb-12">
            <GeneratedRecipe
              recipe={generatedRecipe}
              onSave={handleSave}
              isSaving={isSaving}
              isLoggedIn={!!user}
            />

            {savedSlug && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-green-700 mb-2">
                  ✓ Recipe saved successfully!
                </p>
                <button
                  onClick={() => setShowSignupPrompt(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Want to be recognised as a Community Chef? Join for free →
                </button>
                <div className="mt-3">
                  <Link
                    href={`/recipes/community/${savedSlug}`}
                    className="text-sm font-medium text-primary hover:text-orange-700"
                  >
                    View your recipe →
                  </Link>
                </div>
              </div>
            )}

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
                ← Create another recipe
              </button>
            </div>
          </div>
        )}

        {/* Recent Generated Recipes */}
        {!generatedRecipe && recentGenerated.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Your recent recipes
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recentGenerated.map((recipe, i) => (
                <button
                  key={i}
                  onClick={() => setGeneratedRecipe(recipe)}
                  className="group block rounded-lg overflow-hidden h-40 relative text-left bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200"
                >
                  <div className="h-full flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{recipe.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* See What Others Have Made Section */}
        {!generatedRecipe && (() => {
          const recentGeneratedTitles = new Set(
            recentGenerated.map(r => r.title?.toLowerCase().trim()).filter(Boolean)
          );
          const filteredRecentRecipes = recentRecipes.filter(
            r => !recentGeneratedTitles.has(r.title?.toLowerCase().trim())
          );
          return filteredRecentRecipes.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              See what others have made
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {filteredRecentRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/community/${recipe.slug}`}
                  className="group block rounded-lg overflow-hidden h-40 relative bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200"
                >
                  <div className="h-full flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>
                    <span className="inline-block px-2 py-0.5 text-xs bg-orange-500/80 text-white rounded-full capitalize w-fit">
                      {recipe.cuisine || 'Community'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
        })()}
      </div>

      <AuthModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        initialMode="signup"
      />

      {/* Pantry Modal */}
      {showPantryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPantryModal(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPantryModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-1">Your Pantry Essentials 🧂</h3>
            <p className="text-sm text-gray-500 mb-4">
              We assume you have these basics. Anything missing? Just add it to your ingredients.
            </p>
            <div className="space-y-3">
              {PANTRY_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
