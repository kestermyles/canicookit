import { Metadata } from 'next';
import { getRecipesByIngredient, getPopularIngredients } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';

interface PageProps {
  params: { ingredient: string };
}

export async function generateStaticParams() {
  const ingredients = await getPopularIngredients();
  return ingredients.map((i) => ({ ingredient: i }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const ingredient = decodeURIComponent(params.ingredient);
  const label = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  return {
    title: `${label} Recipes`,
    description: `Recipes with ${label.toLowerCase()}. Simple, delicious meals featuring ${label.toLowerCase()} that you'll actually want to cook.`,
  };
}

export default async function IngredientPage({ params }: PageProps) {
  const ingredient = decodeURIComponent(params.ingredient);
  const recipes = await getRecipesByIngredient(ingredient);
  const label = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Recipes with {label}</h1>
      <p className="text-secondary mb-8">
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
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
            />
          ))}
        </div>
      ) : (
        <p className="text-secondary">
          No recipes found with this ingredient yet.
        </p>
      )}
    </div>
  );
}
