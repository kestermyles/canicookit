import { Metadata } from 'next';
import { getAllRecipes, getAllCuisines } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Recipes',
  description: 'Browse all recipes on Can I Cook It — curated and community recipes across every cuisine and course.',
};

const COURSES = [
  { label: 'Breakfast', filter: 'breakfast' },
  { label: 'Lunch', filter: 'lunch' },
  { label: 'Dinner', filter: 'dinner' },
  { label: 'Snacks', filter: 'snacks' },
  { label: 'Baking', filter: 'baking' },
  { label: 'Starters', filter: 'starters' },
  { label: 'Desserts', filter: 'desserts' },
  { label: 'Drinks', filter: 'drinks' },
];

export default async function RecipesPage() {
  const [recipes, cuisines] = await Promise.all([
    getAllRecipes(),
    getAllCuisines(),
  ]);

  const filteredCuisines = cuisines.filter((c) => c !== 'generated');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">All Recipes</h1>
      <p className="text-secondary mb-8">
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} to explore
      </p>

      {/* Filter Pills */}
      <div className="mb-10 space-y-4">
        {/* Cuisine filters */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">By cuisine</p>
          <div className="flex flex-wrap gap-2">
            {filteredCuisines.map((cuisine) => (
              <Link
                key={cuisine}
                href={`/recipes/cuisine/${cuisine}`}
                className="px-3 py-1.5 rounded-full text-sm border border-orange-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-colors capitalize"
              >
                {cuisine}
              </Link>
            ))}
          </div>
        </div>

        {/* Course filters */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">By course</p>
          <div className="flex flex-wrap gap-2">
            {COURSES.map((course) => (
              <Link
                key={course.filter}
                href={`/recipes/filter/${course.filter}`}
                className="px-3 py-1.5 rounded-full text-sm border border-orange-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {course.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
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
              source={recipe.source}
              qualityScore={recipe.quality_score}
              status={recipe.status}
              photoIsAiGenerated={recipe.photo_is_ai_generated}
            />
          ))}
        </div>
      ) : (
        <p className="text-secondary">No recipes found.</p>
      )}
    </div>
  );
}
