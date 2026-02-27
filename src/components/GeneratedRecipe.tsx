import { GeneratedRecipeData } from '@/types/generator';
import { PANTRY_ESSENTIALS } from '@/types/generator';

interface GeneratedRecipeProps {
  recipe: GeneratedRecipeData;
  onSave: () => void;
  isSaving: boolean;
}

function formatLabel(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Check if an ingredient is from user's list, essentials, or mixed
 */
function categorizeIngredient(ingredient: string, userIngredients: string[]): 'user' | 'essential' | 'mixed' {
  const lowerIngredient = ingredient.toLowerCase();

  // Check if it contains a user ingredient
  const hasUserIngredient = userIngredients.some((ui) =>
    lowerIngredient.includes(ui.toLowerCase())
  );

  // Check if it contains an essential
  const hasEssential = PANTRY_ESSENTIALS.some((e) =>
    lowerIngredient.includes(e.toLowerCase())
  );

  if (hasUserIngredient && !hasEssential) return 'user';
  if (hasEssential && !hasUserIngredient) return 'essential';
  return 'mixed'; // Contains both or neither
}

export default function GeneratedRecipe({
  recipe,
  onSave,
  isSaving,
}: GeneratedRecipeProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
            AI Generated Recipe
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
          <p className="text-secondary text-lg">{recipe.description}</p>
        </div>

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
            <p className="text-sm text-secondary">Total</p>
            <p className="font-semibold">{totalTime} mins</p>
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
        </div>

        {/* Two-column layout: Ingredients + Method */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 mb-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-xl font-bold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, i) => {
                const category = categorizeIngredient(ingredient, recipe.userIngredients);
                const isUserIngredient = category === 'user' || category === 'mixed';
                const isEssential = category === 'essential';

                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2 px-3 py-2 rounded ${
                      isUserIngredient
                        ? 'bg-orange-50 font-medium'
                        : isEssential
                        ? 'text-secondary'
                        : ''
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                        isUserIngredient ? 'bg-primary' : 'bg-gray-400'
                      }`}
                    />
                    <span>{ingredient}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-secondary mt-3 italic">
              Highlighted ingredients are from your list
            </p>
          </div>

          {/* Method */}
          <div>
            <h2 className="text-xl font-bold mb-4">Method</h2>
            <ol className="space-y-4">
              {recipe.method.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Nutrition */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Nutrition per Serving</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{recipe.calories}</p>
              <p className="text-sm text-secondary">Calories</p>
            </div>
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{recipe.protein}g</p>
              <p className="text-sm text-secondary">Protein</p>
            </div>
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{recipe.carbs}g</p>
              <p className="text-sm text-secondary">Carbs</p>
            </div>
            <div className="bg-light-grey rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{recipe.fat}g</p>
              <p className="text-sm text-secondary">Fat</p>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-center pt-6 border-t border-gray-200">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Save this recipe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
