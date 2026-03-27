import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getRecipeBySlug as getDbRecipeBySlug, dbRowToRecipe } from '@/lib/supabase';
import { getAllRecipesSync } from '@/lib/recipes';
import CommunityBadge from '@/components/CommunityBadge';
import CommentSection from '@/components/CommentSection';
import StarRating from '@/components/StarRating';
import AbilityLevel from '@/components/AbilityLevel';
import ReportButton from '@/components/ReportButton';
import NoPhotoPlaceholder from '@/components/NoPhotoPlaceholder';
import PhotoGallery from '@/components/PhotoGallery';
import RecipeBody from '@/components/RecipeBody';
import RecipeQA from '@/components/RecipeQA';
import CookItMyWay from '@/components/CookItMyWay';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Don't generate metadata for slugs that have a curated version
  const curatedRecipes = getAllRecipesSync();
  if (curatedRecipes.some((r) => r.slug === params.slug)) return {};

  const dbRecipe = await getDbRecipeBySlug(params.slug);
  if (!dbRecipe) return {};

  const recipe = dbRowToRecipe(dbRecipe);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const recipeUrl = `https://canicookit.com/recipes/community/${params.slug}`;
  const metaDescription = `${recipe.description} Ready in ${totalTime} minutes. Serves ${recipe.serves}. Community recipe. ${recipe.vegetarian ? 'Vegetarian. ' : ''}${recipe.vegan ? 'Vegan. ' : ''}${recipe.glutenFree ? 'Gluten-free. ' : ''}`;

  // Only use real photos in social cards (not AI-generated)
  const socialImage = recipe.photo_url && !recipe.photo_is_ai_generated ? recipe.photo_url : null;

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
      images: socialImage ? [
        {
          url: socialImage,
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
      images: socialImage ? [socialImage] : [],
    },
  };
}

function formatLabel(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function CommunityRecipePage({ params }: PageProps) {
  // If a curated recipe exists with this slug, redirect to it
  const curatedRecipes = getAllRecipesSync();
  const curatedMatch = curatedRecipes.find((r) => r.slug === params.slug);
  if (curatedMatch) {
    redirect(`/recipes/${curatedMatch.cuisine}/${curatedMatch.slug}`);
  }

  const dbRecipe = await getDbRecipeBySlug(params.slug);

  if (!dbRecipe) notFound();

  const recipe = dbRowToRecipe(dbRecipe);
  const totalTime = recipe.prepTime + recipe.cookTime;

  // Extract method steps from content (heading + following paragraph)
  const contentLines = recipe.content.split('\n');
  const steps: string[] = [];
  for (let i = 0; i < contentLines.length; i++) {
    const trimmed = contentLines[i].trim();
    if (/^\*{0,2}\d+\.?\s/.test(trimmed)) {
      const title = trimmed.replace(/^\*{0,2}\d+\.?\s*/, '').replace(/\*{0,2}$/, '').trim();
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

  // Only include real photos in structured data (not AI-generated)
  const hasRealPhoto = recipe.photo_url && !recipe.photo_is_ai_generated;
  const recipeImage = hasRealPhoto
    ? (recipe.photo_url!.startsWith('http') ? recipe.photo_url! : `https://canicookit.com${recipe.photo_url}`)
    : null;

  // Derive course category from tags
  const courseTags = new Set(['breakfast', 'lunch', 'dinner', 'snacks', 'baking', 'desserts', 'drinks']);
  const courseTag = (recipe.tags || []).find((t) => courseTags.has(t.toLowerCase()));
  const recipeCategory = courseTag
    ? courseTag.charAt(0).toUpperCase() + courseTag.slice(1)
    : 'Main';

  // Use actual cuisine if meaningful, otherwise omit
  const recipeCuisine = recipe.cuisine && recipe.cuisine !== 'generated'
    ? recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    ...(recipeImage && { image: recipeImage }),
    description: recipe.description,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${recipe.serves} servings`,
    recipeCategory,
    ...(recipeCuisine && { recipeCuisine }),
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

      {/* Photo Gallery / Hero Image */}
      <PhotoGallery
        recipeSlug={params.slug}
        heroImage={recipe.heroImage || (recipe.photo_url && !recipe.photo_is_ai_generated ? recipe.photo_url : undefined)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Community Badge */}
        <div className="mb-4">
          <CommunityBadge
            status={recipe.status}
            qualityScore={recipe.quality_score}
            authorName={recipe.user_metadata?.name}
          />
        </div>

        {/* Title and Report Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold font-display">{recipe.title}</h1>
          <ReportButton recipeSlug={params.slug} variant="text" />
        </div>

        {/* Star Rating - Prominent placement */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg inline-block">
          <p className="text-sm text-gray-700 font-medium mb-2">Rate this recipe:</p>
          <StarRating recipeSlug={params.slug} size="large" />
        </div>

        {/* Attribution */}
        {recipe.user_ingredients && recipe.user_ingredients.length > 0 && (
          <p className="text-sm text-foreground/60 mb-4">
            Built by the community using {recipe.user_ingredients.join(', ')}
          </p>
        )}

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

        {/* Ingredients + Method */}
        <RecipeBody
          defaultServings={recipe.serves || 4}
          ingredients={recipe.ingredients}
          methodHtml={recipe.contentHtml}
        />

        {/* Recipe Q&A */}
        <RecipeQA
          recipeTitle={recipe.title}
          recipeDescription={recipe.description}
          ingredients={recipe.ingredients}
        />

        {/* Cook it My Way — after all recipe content */}
        <div className="mt-8 flex justify-center">
          <CookItMyWay
            originalSlug={params.slug}
            originalTitle={recipe.title}
            originalDescription={recipe.description}
            originalIngredients={recipe.ingredients}
            originalMethod={dbRecipe.method}
          />
        </div>

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
