import { GeneratedRecipeData } from '@/types/generator';

interface GeneratedRecipeProps {
  recipe: GeneratedRecipeData;
  onSave: () => void;
  isSaving: boolean;
  isLoggedIn?: boolean;
}

function formatLabel(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
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
            AI Created Recipe
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

        {/* Difficulty + Quick Stats */}
        <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-8">
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Difficulty</p>
            <p className="font-semibold">{formatLabel(recipe.difficulty)}</p>
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
            <p className="text-sm text-secondary">Budget</p>
            <p className="font-semibold">{formatLabel(recipe.budget)}</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-10 py-4 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-xl shadow-lg"
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
              'Yum! Can I Cook It? →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
