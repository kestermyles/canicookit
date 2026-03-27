import { Metadata } from 'next';
import { getAllRecipes } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import RecipeFilterBar from '@/components/RecipeFilterBar';

export const metadata: Metadata = {
  title: 'All Recipes',
  description: 'Browse all recipes on Can I Cook It — curated and community recipes across every cuisine and course.',
};

export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">All Recipes</h1>
      <p className="text-secondary mb-8">
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} to explore
      </p>

      <RecipeFilterBar />

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <>
          {/* Recipes with photos */}
          {(() => {
            const withImage = recipes.filter(
              (r) => r.heroImage && r.heroImage.trim() !== '' && !r.photo_is_ai_generated
            );
            const withoutImage = recipes.filter(
              (r) => !r.heroImage || r.heroImage.trim() === '' || r.photo_is_ai_generated
            );
            return (
              <>
                {withImage.length > 0 && (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                    {withImage.map((recipe) => (
                      <div key={`${recipe.cuisine}-${recipe.slug}`} className="break-inside-avoid mb-6">
                        <RecipeCard
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
                      </div>
                    ))}
                  </div>
                )}

                {/* Recipes without photos */}
                {withoutImage.length > 0 && (
                  <>
                    <div className="mt-12 mb-8 border-t border-gray-200 pt-8">
                      <h2 className="text-xl font-semibold text-gray-500">Be the first to cook this!</h2>
                      <p className="text-sm text-secondary mt-1">These recipes are waiting for someone to bring them to life with a photo.</p>
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                      {withoutImage.map((recipe) => (
                        <div key={`${recipe.cuisine}-${recipe.slug}`} className="break-inside-avoid mb-6">
                          <RecipeCard
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
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </>
      ) : (
        <p className="text-secondary">Nothing here yet — but that could change today.</p>
      )}
    </div>
  );
}
