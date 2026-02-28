'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFeaturedGuides, searchGuides, GuideRow, supabase } from '@/lib/supabase';
import {
  BookOpen,
  AlertCircle,
  Clock,
  Scissors,
  Wheat,
  Users,
  Lightbulb,
  ChefHat,
  Flame,
  Timer,
  UtensilsCrossed,
  Thermometer,
  Scale,
  EggFried,
  Fish,
  Soup,
  Cookie,
  ShoppingCart,
  Milk,
  PartyPopper,
  Apple,
  Carrot,
  Leaf,
  Pizza,
  CakeSlice,
  Wine,
  Coffee
} from 'lucide-react';

const GUIDES_PER_PAGE = 6;
const CATEGORIES = ['All', 'Techniques', 'Ingredients', 'Hosting', 'Basics', 'Kitchen Skills'];

// Map emoji icons to Lucide components
function getGuideIcon(emojiIcon: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Cooking tools & techniques
    '🔪': Scissors,
    '🥘': Soup,
    '🌡️': Thermometer,
    '⏱️': Timer,
    '🔥': Flame,
    '🧑‍🍳': ChefHat,
    '🍳': EggFried,
    '⚖️': Scale,
    '🍽️': UtensilsCrossed,

    // Ingredients
    '🐟': Fish,
    '🍪': Cookie,
    '🌾': Wheat,
    '🧀': Milk, // Cheese -> Milk icon
    '🍎': Apple,
    '🥕': Carrot,
    '🥬': Leaf,
    '🍕': Pizza,
    '🎂': CakeSlice,
    '🍷': Wine,
    '☕': Coffee,

    // Other
    '🛒': ShoppingCart,
    '👥': Users,
    '💡': Lightbulb,
    '🎉': PartyPopper,
  };

  const IconComponent = iconMap[emojiIcon] || BookOpen;
  return <IconComponent className="w-12 h-12 text-primary" />;
}

export default function GuidesPage() {
  const router = useRouter();
  const [allGuides, setAllGuides] = useState<GuideRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GuideRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(GUIDES_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Load all featured guides on mount
  useEffect(() => {
    async function loadGuides() {
      try {
        setIsLoading(true);
        console.log('=== DEBUG: Starting guide fetch ===');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'NOT SET');
        console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');

        // Test 1: Direct Supabase query to check connection
        console.log('Test 1: Direct query to guides table...');
        const { data: allGuidesTest, error: allError } = await supabase
          .from('guides')
          .select('*');

        console.log('Direct query result:', {
          success: !allError,
          error: allError,
          count: allGuidesTest?.length || 0,
          sample: allGuidesTest?.[0]
        });

        // Test 2: Query with status filter
        console.log('Test 2: Query with status=featured filter...');
        const { data: featuredTest, error: featuredError } = await supabase
          .from('guides')
          .select('*')
          .eq('status', 'featured');

        console.log('Featured query result:', {
          success: !featuredError,
          error: featuredError,
          count: featuredTest?.length || 0,
          sample: featuredTest?.[0]
        });

        // Test 3: Use the abstraction function
        console.log('Test 3: Using getFeaturedGuides() function...');
        const featuredGuides = await getFeaturedGuides();

        console.log('=== DEBUG: Fetch complete ===');
        console.log('Number of guides fetched:', featuredGuides.length);
        if (featuredGuides.length > 0) {
          console.log('First guide:', featuredGuides[0]);
          console.log('Categories found:', [...new Set(featuredGuides.map(g => g.category))]);
        } else {
          console.log('WARNING: No guides returned from getFeaturedGuides()');
          console.log('But direct queries found:', {
            all: allGuidesTest?.length || 0,
            featured: featuredTest?.length || 0
          });
        }

        setAllGuides(featuredGuides);
      } catch (err) {
        console.error('=== DEBUG: Error loading guides ===', err);
        setError('Failed to load guides. Please check your Supabase connection.');
      } finally {
        setIsLoading(false);
      }
    }
    loadGuides();
  }, []);

  // Debounce search query (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      if (debouncedQuery.length < 3) {
        return;
      }

      setIsSearching(true);
      const results = await searchGuides(debouncedQuery);
      setSearchResults(results);
      setIsSearching(false);
    }

    performSearch();
  }, [debouncedQuery]);

  // Reset pagination when category changes
  useEffect(() => {
    setVisibleCount(GUIDES_PER_PAGE);
  }, [selectedCategory]);

  const handleGenerateGuide = async () => {
    if (!searchQuery.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: searchQuery,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate guide');
      }

      router.push(`/guides/${data.slug}`);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate guide. Please try again.');
      setIsGenerating(false);
    }
  };

  // Filter guides by category
  const filteredGuides = searchQuery.length >= 3
    ? searchResults
    : selectedCategory === 'All'
    ? allGuides
    : allGuides.filter((guide) => guide.category === selectedCategory);

  const displayedGuides = filteredGuides.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGuides.length;
  const showNoResults = debouncedQuery.length >= 3 && searchResults.length === 0 && !isSearching;

  // Debug render data
  console.log('=== RENDER DEBUG ===', {
    isLoading,
    allGuidesCount: allGuides.length,
    selectedCategory,
    searchQuery,
    filteredGuidesCount: filteredGuides.length,
    displayedGuidesCount: displayedGuides.length,
    hasMore,
    showNoResults
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
            Cooking Guides
          </h1>
          <p className="text-foreground/70 text-xl max-w-2xl mx-auto mb-8">
            Master the fundamentals. Learn the techniques that matter. Cook with
            confidence.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to know? e.g. 'how to debone a chicken', 'what is deglazing'"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary transition-colors pr-12"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            )}
          </div>

          {/* Category Filter Pills */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* No Results CTA */}
        {showNoResults && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
              <div className="mb-4 flex justify-center">
                <BookOpen className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                We don't have a guide for that yet
              </h2>
              <p className="text-secondary mb-6">
                Want us to create one? We'll use AI to generate a comprehensive guide
                about "{searchQuery}" just for you.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerateGuide}
                disabled={isGenerating}
                className="px-8 py-4 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Creating your guide...
                  </span>
                ) : (
                  'Create This Guide'
                )}
              </button>

              {isGenerating && (
                <p className="text-sm text-gray-500 mt-4">
                  This usually takes 10-20 seconds...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <svg
              className="animate-spin h-12 w-12 mx-auto mb-4 text-primary"
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
            <p className="text-secondary text-lg">Loading guides from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="mb-4 flex justify-center">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-red-900">Connection Error</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600">
                Make sure you've run the Supabase migration and your environment variables are set correctly.
              </p>
            </div>
          </div>
        )}

        {/* Guides Grid */}
        {!isLoading && displayedGuides.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group block bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>{getGuideIcon(guide.icon)}</div>
                    <div className="flex flex-col items-end gap-1">
                      {guide.source === 'ai-generated' && (
                        <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                          AI
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {guide.category}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-display">
                    {guide.title}
                  </h2>
                  <p className="text-secondary text-sm mb-4 line-clamp-2">
                    {guide.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <Clock className="w-4 h-4" />
                    {guide.read_time}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + GUIDES_PER_PAGE)}
                  className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:border-primary hover:text-primary transition-colors font-semibold"
                >
                  Load More Guides
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Showing {displayedGuides.length} of {filteredGuides.length} guides
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty state when no guides in category */}
        {!isLoading && displayedGuides.length === 0 && !showNoResults && !isSearching && selectedCategory !== 'All' && !error && (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center">
              <BookOpen className="w-20 h-20 text-gray-300" />
            </div>
            <p className="text-secondary text-lg">
              No {selectedCategory.toLowerCase()} guides yet. Try another category!
            </p>
          </div>
        )}

        {/* Empty state when no search */}
        {!isLoading && displayedGuides.length === 0 && !showNoResults && !isSearching && selectedCategory === 'All' && !searchQuery && !error && (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center">
              <BookOpen className="w-20 h-20 text-gray-300" />
            </div>
            <p className="text-secondary text-lg mb-4">
              No guides in database yet.
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Run the SQL migration in your Supabase dashboard to load the 18 curated guides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
