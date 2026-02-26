import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRecipeBySlug, getAllRecipes } from '@/lib/recipes';

interface PageProps {
  params: { cuisine: string; slug: string };
}

export async function generateStaticParams() {
  const recipes = getAllRecipes();
  return recipes.map((recipe) => ({
    cuisine: recipe.cuisine.toLowerCase(),
    slug: recipe.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const recipe = getRecipeBySlug(params.cuisine, params.slug);
  if (!recipe) return {};

  const totalTime = recipe.prepTime + recipe.cookTime;

  return {
    title: recipe.title,
    description: `${recipe.description} Ready in ${totalTime} minutes. Serves ${recipe.serves}.`,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: recipe.heroImage ? [recipe.heroImage] : [],
    },
  };
}

function formatLabel(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function RecipePage({ params }: PageProps) {
  const recipe = getRecipeBySlug(params.cuisine, params.slug);

  if (!recipe) notFound();

  const totalTime = recipe.prepTime + recipe.cookTime;

  // Extract method steps from markdown for JSON-LD
  // Matches: "1. text", "**1. text**", "**1. text"
  const steps = recipe.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\*{0,2}\d+\.?\s/.test(line))
    .map((line) => line.replace(/^\*{0,2}\d+\.?\s*/, '').replace(/\*{0,2}$/, '').trim())
    .filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.heroImage,
    description: recipe.description,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${recipe.serves} servings`,
    recipeCategory: recipe.tags[0] || 'Main',
    recipeCuisine: recipe.cuisine,
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.protein}g`,
      carbohydrateContent: `${recipe.carbs}g`,
      fatContent: `${recipe.fat}g`,
    },
    recipeIngredient: recipe.ingredients,
    recipeInstructions: steps.map((step) => ({
      '@type': 'HowToStep',
      text: step,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Image */}
      {recipe.heroImage && (
        <div className="relative w-full h-64 md:h-96 bg-light-grey">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.heroImage}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-secondary text-lg mb-6">{recipe.description}</p>

        {/* Dietary badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.vegetarian && (
            <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              Vegetarian
            </span>
          )}
          {recipe.vegan && (
            <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              Vegan
            </span>
          )}
          {recipe.dairyFree && (
            <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
              Dairy Free
            </span>
          )}
          {recipe.glutenFree && (
            <span className="px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">
              Gluten Free
            </span>
          )}
          {recipe.studentKitchen && (
            <span className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
              Student Kitchen
            </span>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-8">
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Prep</p>
            <p className="font-semibold">{recipe.prepTime} mins</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Cook</p>
            <p className="font-semibold">{recipe.cookTime} mins</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Serves</p>
            <p className="font-semibold">{recipe.serves}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Difficulty</p>
            <p className="font-semibold">{formatLabel(recipe.difficulty)}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Budget</p>
            <p className="font-semibold">{formatLabel(recipe.budget)}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Calories</p>
            <p className="font-semibold">{recipe.calories}</p>
          </div>
        </div>

        {/* Two-column layout: Ingredients + Method */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-xl font-bold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Method */}
          <div>
            <h2 className="text-xl font-bold mb-4">Method</h2>
            <div
              className="recipe-content"
              dangerouslySetInnerHTML={{ __html: recipe.contentHtml }}
            />
          </div>
        </div>

        {/* Video */}
        {recipe.videoUrl && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">Video</h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={recipe.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={`${recipe.title} video`}
              />
            </div>
          </section>
        )}

        {/* Additional Images */}
        {recipe.images && recipe.images.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recipe.images.map((img, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] relative rounded-lg overflow-hidden bg-light-grey"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${recipe.title} - photo ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nutrition */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Nutrition per Serving</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {recipe.calories}
              </p>
              <p className="text-sm text-secondary">Calories</p>
            </div>
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {recipe.protein}g
              </p>
              <p className="text-sm text-secondary">Protein</p>
            </div>
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {recipe.carbs}g
              </p>
              <p className="text-sm text-secondary">Carbs</p>
            </div>
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{recipe.fat}g</p>
              <p className="text-sm text-secondary">Fat</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
