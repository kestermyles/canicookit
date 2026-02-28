import Link from 'next/link';
import { getAllRecipes, getAllCuisines, getPopularIngredients } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import SearchBar from '@/components/SearchBar';
import QuickFilterBar from '@/components/QuickFilterBar';
import { Star, ChefHat, Coffee, Salad, UtensilsCrossed, Cookie, CakeSlice, Soup, IceCream, Wine } from 'lucide-react';

// Revalidate every 60 seconds to show fresh community recipes
export const revalidate = 60;

function formatDifficulty(d: string): string {
  return d
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function HomePage() {
  const allRecipes = await getAllRecipes();
  const cuisines = await getAllCuisines();
  const popularIngredients = await getPopularIngredients();
  const recipeCount = allRecipes.length;

  // Get recipe of the week - auto-rotates based on quality scores
  // Priority: highest-scored community recipe from last 7 days with REAL photos
  // Fallback: highest-scored curated recipe if no recent community recipes
  // NEVER show AI-generated images in hero
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Helper function: Check if recipe has a real (non-AI) photo
  const hasRealPhoto = (recipe: any) => {
    return recipe.heroImage && (recipe.photo_is_ai_generated === false || recipe.photo_is_ai_generated === null || recipe.photo_is_ai_generated === undefined);
  };

  // Try to get recent community recipes first (ONLY with real photos)
  const recentCommunityRecipes = allRecipes
    .filter((r) => {
      if (!hasRealPhoto(r) || r.source !== 'community') return false;
      // CRITICAL: Explicitly filter out AI-generated images
      if (r.photo_is_ai_generated === true) return false;
      if (r.created_at) {
        const createdDate = new Date(r.created_at);
        return createdDate >= sevenDaysAgo;
      }
      return false;
    })
    .sort((a, b) => {
      const scoreA = a.quality_score || 0;
      const scoreB = b.quality_score || 0;
      return scoreB - scoreA;
    });

  // Fallback to highest-rated curated recipe (ONLY with real photos)
  const curatedWithRealPhotos = [...allRecipes]
    .filter((r) => hasRealPhoto(r) && r.source === 'curated')
    .sort((a, b) => {
      const scoreA = a.quality_score || 10; // Curated recipes default to 10
      const scoreB = b.quality_score || 10;
      return scoreB - scoreA;
    });

  // Final fallback: any recipe with REAL photo (explicitly not AI-generated)
  const anyRecipeWithRealPhoto = allRecipes.find((r) => hasRealPhoto(r));

  const recipeOfWeek = recentCommunityRecipes[0] || curatedWithRealPhotos[0] || anyRecipeWithRealPhoto;

  // Sort remaining recipes by photo quality
  const recipes = [...allRecipes]
    .filter((r) => r.slug !== recipeOfWeek?.slug) // Exclude recipe of week
    .sort((a, b) => {
      const scoreA = a.heroImage ? (a.quality_score || 10) : 0;
      const scoreB = b.heroImage ? (b.quality_score || 10) : 0;
      return scoreB - scoreA;
    });

  const searchIndex = allRecipes.map((r) => ({
    title: r.title,
    slug: r.slug,
    cuisine: r.cuisine,
    description: r.description,
    ingredients: r.ingredients,
    tags: r.tags,
    heroImage: r.heroImage,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    difficulty: r.difficulty,
    calories: r.calories,
    source: r.source,
    qualityScore: r.quality_score,
    status: r.status,
    photoIsAiGenerated: r.photo_is_ai_generated,
  }));

  const heroUrl = recipeOfWeek?.source === 'community'
    ? `/recipes/community/${recipeOfWeek.slug}`
    : `/recipes/${recipeOfWeek?.cuisine}/${recipeOfWeek?.slug}`;

  return (
    <>
      {/* Hero / Search */}
      <div className="max-w-6xl mx-auto px-4">
        <section className="py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
            What do you want to cook today<span className="text-primary">?</span>
          </h1>
          <p className="text-foreground/70 text-xl mb-4 max-w-2xl mx-auto">
            Type any ingredients you have — we'll build a recipe around them.
          </p>
          <p className="text-secondary text-lg mb-8 max-w-md mx-auto">
            Find a recipe or build one from what you've got. Every dish cooked here adds to the collection.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar recipes={searchIndex} />
            <p className="text-center text-sm text-secondary mt-4">
              {recipeCount.toLocaleString()} recipes and counting — built by the community
            </p>
          </div>
        </section>
      </div>

      {/* Recipe of the Week - Full Width Hero */}
      {recipeOfWeek ? (
        <section className="relative w-full h-[500px] mb-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipeOfWeek.heroImage}
              alt={recipeOfWeek.title}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-end pb-12">
            <div className="max-w-2xl">
              {/* Recipe of the Week Badge */}
              <div className="inline-block mb-4">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Recipe of the Week
                </span>
              </div>

              {/* Cuisine Tag */}
              <div className="mb-3">
                <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full uppercase tracking-wide">
                  {recipeOfWeek.cuisine}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight font-display">
                {recipeOfWeek.title}
              </h2>

              {/* Description */}
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                {recipeOfWeek.description}
              </p>

              {/* CTA Button */}
              <Link
                href={heroUrl}
                className="inline-block px-8 py-4 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors shadow-lg"
              >
                Cook This →
              </Link>
            </div>
          </div>
        </section>
      ) : (
        // Placeholder when no recipes with real photos are available
        <section className="relative w-full h-[500px] mb-12 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />

          {/* Content Overlay */}
          <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center justify-center text-center">
            <div className="max-w-2xl">
              <div className="mb-6 flex justify-center">
                <ChefHat className="w-32 h-32 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight font-display">
                Be the first to share a recipe!
              </h2>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Community recipes with real photos will be featured here. Upload your dish photo to get featured!
              </p>
              <Link
                href="/generate"
                className="inline-block px-8 py-4 text-lg font-semibold bg-white text-orange-600 rounded-full transition-colors shadow-lg hover:bg-gray-100"
              >
                Generate a Recipe →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Masonry/Pinterest-Style Recipe Grid */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Quick Filter Bar */}
        <QuickFilterBar />

        {recipes.length > 0 && (
          <section className="pb-12">
            {/* Masonry Grid using CSS columns */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
              {recipes.slice(0, 3).map((recipe, index) => (
                <div key={`${recipe.source || 'curated'}-${recipe.slug}`} className="break-inside-avoid mb-4">
                  <RecipeCard {...recipe} photoIsAiGenerated={recipe.photo_is_ai_generated} />
                </div>
              ))}

              {/* Ad card at position 4 */}
              <div className="break-inside-avoid mb-4">
                <div className="rounded-lg overflow-hidden bg-stone-100 shadow-sm hover:shadow-lg transition-shadow flex items-center justify-center min-h-[250px] relative">
                  <span className="absolute top-3 right-3 text-xs text-gray-500 uppercase tracking-wide">
                    Sponsored
                  </span>
                  <div className="text-center text-gray-400 py-12">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 opacity-40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="text-sm">Advertisement</p>
                  </div>
                  {/* TODO: Replace inner content with AdSense unit (300x250) */}
                </div>
              </div>

              {/* Remaining recipes */}
              {recipes.slice(3).map((recipe) => (
                <div key={`${recipe.source || 'curated'}-${recipe.slug}`} className="break-inside-avoid mb-4">
                  <RecipeCard {...recipe} photoIsAiGenerated={recipe.photo_is_ai_generated} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Course */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8">Browse by Course</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/recipes/filter/breakfast"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              Breakfast
            </Link>
            <Link
              href="/recipes/filter/lunch"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Salad className="w-4 h-4" />
              Lunch
            </Link>
            <Link
              href="/recipes/filter/dinner"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Dinner
            </Link>
            <Link
              href="/recipes/filter/snacks"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Cookie className="w-4 h-4" />
              Snacks
            </Link>
            <Link
              href="/recipes/filter/baking"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <CakeSlice className="w-4 h-4" />
              Baking
            </Link>
            <Link
              href="/recipes/filter/starters"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Soup className="w-4 h-4" />
              Starters
            </Link>
            <Link
              href="/recipes/filter/desserts"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <IceCream className="w-4 h-4" />
              Desserts
            </Link>
            <Link
              href="/recipes/filter/drinks"
              className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Wine className="w-4 h-4" />
              Drinks
            </Link>
          </div>
        </section>

        {/* Browse by Cuisine */}
        {cuisines.length > 0 && (
          <section className="py-12">
            <h2 className="text-2xl font-bold mb-8">Browse by Cuisine</h2>
            <div className="flex flex-wrap gap-3">
              {cuisines.map((cuisine) => (
                <Link
                  key={cuisine}
                  href={`/recipes/cuisine/${cuisine}`}
                  className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors capitalize"
                >
                  {cuisine}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Ingredient */}
        {popularIngredients.length > 0 && (
          <section className="py-12">
            <h2 className="text-2xl font-bold mb-8">Browse by Ingredient</h2>
            <div className="flex flex-wrap gap-3">
              {popularIngredients.map((ingredient) => (
                <Link
                  key={ingredient}
                  href={`/recipes/ingredient/${ingredient}`}
                  className="px-4 py-2 rounded-full bg-light-grey text-foreground hover:bg-primary hover:text-white transition-colors capitalize"
                >
                  {ingredient}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Basics CTA */}
        <section className="py-12">
          <div className="bg-light-grey rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">New to cooking?</h2>
            <p className="text-secondary mb-6 max-w-md mx-auto">
              Start with the stuff nobody tells you — how to season food, when
              chicken is actually cooked, and more.
            </p>
            <Link
              href="/basics"
              className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-orange-700 transition-colors"
            >
              Read the Basics
            </Link>
          </div>
        </section>

        {/* Empty state */}
        {recipes.length === 0 && (
          <section className="py-16 text-center">
            <p className="text-secondary text-lg">
              No recipes yet. Add your first recipe to the{' '}
              <code className="bg-light-grey px-2 py-1 rounded text-sm">
                recipes/
              </code>{' '}
              folder to get started.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
