import Link from 'next/link';

interface NoResultsCTAProps {
  searchQuery: string;
}

function detectInputType(query: string): 'dish' | 'ingredients' {
  // Check if it looks like ingredients (contains commas or is 4+ words)
  const hasCommas = query.includes(',');
  const wordCount = query.trim().split(/\s+/).length;

  if (hasCommas || wordCount >= 4) {
    return 'ingredients';
  }

  // Otherwise treat as dish name (1-3 words, no commas)
  return 'dish';
}

function getIngredientEmoji(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Fish/seafood
  if (lowerQuery.match(/fish|salmon|tuna|cod|trout|seafood|shrimp|prawn|lobster|crab/)) return '🐟';

  // Meat
  if (lowerQuery.match(/chicken|beef|pork|lamb|turkey|meat|steak|bacon|sausage/)) return '🍖';

  // Vegetables
  if (lowerQuery.match(/vegetable|tomato|carrot|broccoli|spinach|lettuce|pepper|onion|potato|garlic/)) return '🥬';

  // Fruits
  if (lowerQuery.match(/apple|banana|orange|berry|fruit|lemon|lime|mango/)) return '🍎';

  // Pasta/grains
  if (lowerQuery.match(/pasta|rice|noodle|spaghetti|grain|wheat/)) return '🍝';

  // Cheese/dairy
  if (lowerQuery.match(/cheese|milk|cream|butter|dairy|yogurt/)) return '🧀';

  // Eggs
  if (lowerQuery.match(/egg/)) return '🥚';

  // Bread
  if (lowerQuery.match(/bread|toast|baguette/)) return '🍞';

  // Return empty string if no match
  return '';
}

export default function NoResultsCTA({ searchQuery }: NoResultsCTAProps) {
  const inputType = detectInputType(searchQuery);
  const isDish = inputType === 'dish';
  const emoji = isDish ? '' : getIngredientEmoji(searchQuery);

  const urlParam = isDish ? 'dish' : 'ingredients';
  const heading = isDish
    ? `Let's make ${searchQuery}!`
    : "Nice — let's cook with that!";
  const subtext = isDish
    ? "We'll build you a proper recipe in seconds"
    : "Tell us what else you've got and we'll build something great";
  const buttonText = isDish ? "Create This Recipe" : "Build This Recipe";

  return (
    <div className="max-w-2xl mx-auto my-12 text-center">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 shadow-lg">
        {emoji && <div className="text-6xl mb-4">{emoji}</div>}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {heading}
        </h2>
        <p className="text-gray-700 mb-6">
          {subtext}
        </p>

        <Link
          href={`/generate?${urlParam}=${encodeURIComponent(searchQuery)}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-8 py-4 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="text-xl">✨</span>
          <span>{buttonText}</span>
        </Link>

        <p className="text-sm text-gray-600 mt-4">
          Custom recipe created in seconds
        </p>
      </div>
    </div>
  );
}
