import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRecipeBySlug, getRecipesByCuisine } from '@/lib/recipes';
import StarRating from '@/components/StarRating';
import CommentSection from '@/components/CommentSection';
import PhotoGallery from '@/components/PhotoGallery';
import RecipeBody from '@/components/RecipeBody';
import { extractIngredients, stripIngredientsHtml } from '@/utils/parseRecipeContent';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const recipes = await getRecipesByCuisine('from-scratch');
    return recipes.map((recipe) => ({
      slug: recipe.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const recipe = await getRecipeBySlug('from-scratch', params.slug);
  if (!recipe) return {};

  const recipeUrl = `https://canicookit.com/from-scratch/${params.slug}`;
  const metaDescription = `${recipe.description} ${recipe.prepTime} minutes active time. Serves ${recipe.serves}.`;

  return {
    title: `${recipe.title} — From Scratch`,
    description: metaDescription,
    alternates: {
      canonical: recipeUrl,
    },
    openGraph: {
      type: 'article',
      url: recipeUrl,
      title: recipe.title,
      description: metaDescription,
      images: recipe.heroImage
        ? [
            {
              url: recipe.heroImage,
              width: 1200,
              height: 630,
              alt: recipe.title,
            },
          ]
        : [],
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

export default async function FromScratchRecipePage({ params }: PageProps) {
  const recipe = await getRecipeBySlug('from-scratch', params.slug);

  if (!recipe) notFound();

  // Extract the hook — everything before the first "---" or "## " after the H1
  const lines = recipe.content.split('\n');
  let hookLines: string[] = [];
  let pastTitle = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!pastTitle) {
      if (trimmed.startsWith('# ')) {
        pastTitle = true;
      }
      continue;
    }
    // Stop at a horizontal rule or a ## heading
    if (trimmed === '---' || /^##\s/.test(trimmed)) break;
    hookLines.push(line);
  }
  const hookText = hookLines.join('\n').trim();

  // Extract ingredients and strip from HTML
  const detailedIngredients = extractIngredients(recipe.content);
  const methodHtml = stripIngredientsHtml(recipe.contentHtml);

  // Method steps for JSON-LD
  const steps = recipe.content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\*{0,2}\d+\.?\s/.test(line))
    .map((line) =>
      line
        .replace(/^\*{0,2}\d+\.?\s*/, '')
        .replace(/\*{0,2}$/, '')
        .trim()
    )
    .filter(Boolean);

  const totalTime = recipe.prepTime + recipe.cookTime;

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
    recipeCategory: 'Main',
    recipeCuisine: 'From Scratch',
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

      {/* Hero / Photo Gallery */}
      <PhotoGallery
        recipeSlug={params.slug}
        heroImage={recipe.heroImage || undefined}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Title + Subtitle */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-display">
          {recipe.title}
        </h1>
        <p className="text-secondary text-lg mb-6">{recipe.description}</p>

        {/* The Hook — styled callout */}
        {hookText && (
          <div className="bg-orange-50 border-l-4 border-primary rounded-r-lg p-6 mb-8">
            {hookText.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className={`text-foreground/80 leading-relaxed ${i > 0 ? 'mt-3' : ''}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Quick Stats Bar — Active Time, not total */}
        <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-8">
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Serves</p>
            <p className="font-semibold">{recipe.serves}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Active Time</p>
            <p className="font-semibold">{recipe.prepTime} mins</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Difficulty</p>
            <p className="font-semibold">{formatLabel(recipe.difficulty)}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Budget</p>
            <p className="font-semibold">{formatLabel(recipe.budget)}</p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-8 p-4 bg-orange-50 rounded-lg inline-block">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Rate this recipe:
          </p>
          <StarRating recipeSlug={params.slug} size="large" />
        </div>

        {/* Ingredients + Method */}
        <RecipeBody
          defaultServings={recipe.serves || 4}
          ingredients={
            detailedIngredients.length > 0
              ? detailedIngredients
              : recipe.ingredients
          }
          methodHtml={methodHtml}
        />

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

        {/* Comments */}
        <section id="photo-upload" className="mt-12 border-t pt-8 scroll-mt-20">
          <CommentSection recipeSlug={params.slug} />
        </section>
      </div>
    </>
  );
}
