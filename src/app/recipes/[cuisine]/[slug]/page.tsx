import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRecipeBySlug, getAllRecipes } from '@/lib/recipes';
import StarRating from '@/components/StarRating';
import AbilityLevel from '@/components/AbilityLevel';

interface PageProps {
  params: { cuisine: string; slug: string };
}

export async function generateStaticParams() {
  try {
    const recipes = await getAllRecipes();
    return recipes.map((recipe) => ({
      cuisine: recipe.cuisine.toLowerCase(),
      slug: recipe.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Tell Next.js to generate these pages at build time
// Dynamic params enabled to allow server-side rendering of newly generated recipes
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const recipe = await getRecipeBySlug(params.cuisine, params.slug);
  if (!recipe) return {};

  const totalTime = recipe.prepTime + recipe.cookTime;
  const recipeUrl = `https://canicookit.com/recipes/${params.cuisine}/${params.slug}`;
  const metaDescription = `${recipe.description} Ready in ${totalTime} minutes. Serves ${recipe.serves}. ${recipe.vegetarian ? 'Vegetarian. ' : ''}${recipe.vegan ? 'Vegan. ' : ''}${recipe.glutenFree ? 'Gluten-free. ' : ''}`;

  return {
    title: `${recipe.title} | Can I Cook It?`,
    description: metaDescription,
    alternates: {
      canonical: recipeUrl,
    },
    openGraph: {
      type: 'article',
      url: recipeUrl,
      title: recipe.title,
      description: metaDescription,
      images: recipe.heroImage ? [
        {
          url: recipe.heroImage,
          width: 1200,
          height: 630,
          alt: recipe.title,
        }
      ] : [],
      siteName: 'Can I Cook It?',
    },
    twitter: {
      card: 'summary_large_image',
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

export default async function RecipePage({ params }: PageProps) {
  const recipe = await getRecipeBySlug(params.cuisine, params.slug);

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
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">{recipe.title}</h1>

        {/* Star Rating - Prominent placement */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg inline-block">
          <p className="text-sm text-gray-700 font-medium mb-2">Rate this recipe:</p>
          <StarRating recipeSlug={params.slug} size="large" />
        </div>

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

        {/* Ability Level Selector */}
        <section className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-bold mb-3">Cooking Ability Level</h2>
          <AbilityLevel currentDifficulty={recipe.difficulty} readonly />
        </section>

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

        {/* Two-column layout: Ingredients + Method + Sidebar Ad */}
        <div className="lg:grid lg:grid-cols-[1fr_2fr_300px] lg:gap-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 lg:col-span-2">
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

            {/* Ad slot between ingredients and method (mobile/tablet only) */}
            <div className="lg:hidden col-span-full">
              <div className="flex items-center justify-center bg-stone-50 rounded-lg py-6 px-4 relative">
                <span className="absolute top-2 right-3 text-xs text-gray-400 uppercase tracking-wide">
                  Sponsored
                </span>
                <p className="text-sm text-gray-400">Advertisement</p>
                {/* TODO: Replace with AdSense leaderboard unit (728x90 desktop / 320x50 mobile) */}
              </div>
            </div>

            {/* Method */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4">Method</h2>
              <div
                className="recipe-content"
                dangerouslySetInnerHTML={{ __html: recipe.contentHtml }}
              />
            </div>
          </div>

          {/* Sidebar Ad (desktop only - sticky) */}
          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <div className="w-[300px] h-[250px] bg-stone-50 rounded-lg flex items-center justify-center relative">
                <span className="absolute top-2 right-3 text-xs text-gray-400 uppercase tracking-wide">
                  Sponsored
                </span>
                <p className="text-sm text-gray-400">Advertisement</p>
                {/* TODO: Replace with AdSense medium rectangle (300x250) */}
              </div>
            </div>
          </aside>
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
