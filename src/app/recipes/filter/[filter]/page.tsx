import { Metadata } from 'next';
import { getRecipesByFilter } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';

interface PageProps {
  params: { filter: string };
}

const FILTER_LABELS: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'student-kitchen': 'Student Kitchen',
  'dairy-free': 'Dairy Free',
  'gluten-free': 'Gluten Free',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  baking: 'Baking',
  starters: 'Starters',
  desserts: 'Desserts',
  drinks: 'Drinks',
};

const FILTER_DESCRIPTIONS: Record<string, string> = {
  vegetarian: 'Meat-free recipes that are anything but boring.',
  vegan: 'Plant-based recipes that actually taste great.',
  'student-kitchen':
    'Cheap, easy recipes for when all you have is a hob and a dream.',
  'dairy-free': 'Delicious dairy-free recipes for every occasion.',
  'gluten-free': "Gluten-free recipes that don't compromise on taste.",
  breakfast: 'Start your day right with these breakfast recipes.',
  lunch: 'Quick and satisfying lunch ideas.',
  dinner: 'Delicious dinner recipes for every night of the week.',
  snacks: 'Perfect snacks for any time of day.',
  baking: 'From cakes to bread, bake something delicious.',
  starters: 'Impressive starters to kick off any meal.',
  desserts: 'Sweet treats to finish on a high note.',
  drinks: 'Refreshing drinks and cocktails.',
};

export async function generateStaticParams() {
  return Object.keys(FILTER_LABELS).map((filter) => ({ filter }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const label = FILTER_LABELS[params.filter] || params.filter;
  const desc =
    FILTER_DESCRIPTIONS[params.filter] || `Browse ${label} recipes.`;
  return {
    title: `${label} Recipes`,
    description: desc,
  };
}

export default async function FilterPage({ params }: PageProps) {
  const recipes = await getRecipesByFilter(params.filter);
  const label = FILTER_LABELS[params.filter] || params.filter;
  const description = FILTER_DESCRIPTIONS[params.filter] || '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{label} Recipes</h1>
      {description && <p className="text-secondary mb-8">{description}</p>}

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
          No {label.toLowerCase()} recipes yet.
        </p>
      )}
    </div>
  );
}
