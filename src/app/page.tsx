import Link from 'next/link';
import { getAllRecipes, getAllCuisines, getPopularIngredients } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  const recipes = getAllRecipes();
  const cuisines = getAllCuisines();
  const popularIngredients = getPopularIngredients();

  const searchIndex = recipes.map((r) => ({
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
  }));

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero / Search */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          What do you want to cook<span className="text-primary">?</span>
        </h1>
        <p className="text-secondary text-lg mb-8 max-w-xl mx-auto">
          Simple recipes with clear instructions. No fuss, no jargon.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar recipes={searchIndex} />
        </div>
      </section>

      {/* Featured Recipes */}
      {recipes.length > 0 && (
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8">Featured Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.slice(0, 9).map((recipe) => (
              <RecipeCard
                key={`${recipe.cuisine}-${recipe.slug}`}
                title={recipe.title}
                slug={recipe.slug}
                cuisine={recipe.cuisine}
                description={recipe.description}
                heroImage={recipe.heroImage}
                prepTime={recipe.prepTime}
                cookTime={recipe.cookTime}
                difficulty={recipe.difficulty}
                calories={recipe.calories}
              />
            ))}
          </div>
        </section>
      )}

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
  );
}
