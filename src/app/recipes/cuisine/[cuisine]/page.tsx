import { Metadata } from 'next';
import { getAllCuisines, getRecipesByCuisine } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';

interface PageProps {
  params: { cuisine: string };
}

export async function generateStaticParams() {
  const cuisines = await getAllCuisines();
  return cuisines.map((c) => ({ cuisine: c.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const cuisine = params.cuisine;
  const label = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
  return {
    title: `${label} Recipes`,
    description: `Browse all ${label.toLowerCase()} recipes on Can I Cook It? Simple, delicious ${label.toLowerCase()} food you'll actually want to make.`,
  };
}

export default async function CuisinePage({ params }: PageProps) {
  const recipes = await getRecipesByCuisine(params.cuisine);
  const label = params.cuisine.charAt(0).toUpperCase() + params.cuisine.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{label} Recipes</h1>
      <p className="text-secondary mb-8">
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} to explore
      </p>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.slug}
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
        <p className="text-secondary">
          No recipes found for this cuisine yet.
        </p>
      )}
    </div>
  );
}
