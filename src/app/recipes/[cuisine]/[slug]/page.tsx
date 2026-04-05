import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRecipeBySlug, getAllRecipes } from '@/lib/recipes';
import StarRating from '@/components/StarRating';
import AbilityLevel from '@/components/AbilityLevel';
import CommentSection from '@/components/CommentSection';
import NoPhotoPlaceholder from '@/components/NoPhotoPlaceholder';
import PhotoGallery from '@/components/PhotoGallery';
import RecipeBody from '@/components/RecipeBody';
import RecipeQA from '@/components/RecipeQA';
import { extractIngredients, stripIngredientsHtml } from '@/utils/parseRecipeContent';

function isBatchRecipe(tags: string[] = []): boolean {
  const batchKeywords = ['cookies', 'biscuits', 'brownies', 'muffins', 'cupcakes', 'scones', 'flapjacks', 'traybakes', 'bars', 'shortbread'];
  return batchKeywords.some(kw => tags.some(tag => tag.toLowerCase().includes(kw)));
}

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
    title: recipe.title,
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

  // Extract full ingredient list from markdown body (with quantities)
  const detailedIngredients = extractIngredients(recipe.content);
  // Strip the Ingredients section from the rendered HTML (ServingScaler handles it)
  const methodHtml = stripIngredientsHtml(recipe.contentHtml);

  // Extract method steps from markdown for JSON-LD
  // Captures the numbered heading + following paragraph text
  const contentLines = recipe.content.split('\n');
  const steps: string[] = [];
  for (let i = 0; i < contentLines.length; i++) {
    const trimmed = contentLines[i].trim();
    if (/^\*{0,2}\d+\.?\s/.test(trimmed)) {
      const title = trimmed.replace(/^\*{0,2}\d+\.?\s*/, '').replace(/\*{0,2}$/, '').trim();
      // Collect following non-empty, non-heading, non-image lines as step body
      const bodyParts: string[] = [];
      for (let j = i + 1; j < contentLines.length; j++) {
        const next = contentLines[j].trim();
        if (!next || /^\*{0,2}\d+\.?\s/.test(next) || next.startsWith('#') || next.startsWith('![')) break;
        bodyParts.push(next);
      }
      const fullStep = bodyParts.length > 0 ? `${title}: ${bodyParts.join(' ')}` : title;
      if (fullStep) steps.push(fullStep);
    }
  }

  // Use detailed ingredients (with quantities) for JSON-LD, fall back to frontmatter
  const jsonLdIngredients = detailedIngredients.length > 0 ? detailedIngredients : recipe.ingredients;

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
    recipeIngredient: jsonLdIngredients,
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

      {/* Photo Gallery / Hero Image */}
      <PhotoGallery
        recipeSlug={params.slug}
        heroImage={recipe.heroImage || undefined}
        heroImagePosition={recipe.heroImagePosition}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
            <p className="text-sm text-secondary">{isBatchRecipe(recipe.tags) ? 'Makes' : 'Serves'}</p>
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

        {/* Ingredients + Method */}
        <RecipeBody
          defaultServings={recipe.serves || 4}
          ingredients={detailedIngredients.length > 0 ? detailedIngredients : recipe.ingredients}
          methodHtml={methodHtml}
          tags={recipe.tags}
        />

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

        {/* Recipe Q&A */}
        <RecipeQA
          recipeTitle={recipe.title}
          recipeDescription={recipe.description}
          ingredients={recipe.ingredients}
          recipeSlug={recipe.slug}
        />

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

        {/* Share & Comments Section */}
        <section id="photo-upload" className="mt-12 border-t pt-8 scroll-mt-20">
          <CommentSection recipeSlug={params.slug} />
        </section>
      </div>
    </>
  );
}
