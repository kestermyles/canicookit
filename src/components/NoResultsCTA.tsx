import Link from 'next/link';

interface NoResultsCTAProps {
  searchQuery: string;
}

function detectInputType(query: string): 'dish' | 'ingredients' {
  const trimmed = query.trim();
  const lowerQuery = trimmed.toLowerCase();

  // 1. If it contains commas, it's definitely ingredients
  if (query.includes(',')) {
    return 'ingredients';
  }

  const words = trimmed.split(/\s+/);
  const wordCount = words.length;

  // 2. Single word is ambiguous, treat as dish name
  if (wordCount === 1) {
    return 'dish';
  }

  // 3. Check for dish name connective words (words that connect parts of dish names)
  const dishConnectives = [
    // Foreign language connectors
    'alla', 'au', 'aux', 'de', 'del', 'della', 'le', 'la', 'el', 'à', 'a la', 'al',
    // English connectors
    'with', 'and', 'in', 'on', 'of', '&',
    // Dish type words that connect
    'pie', 'tart', 'soup', 'stew', 'curry', 'roast', 'grilled', 'baked', 'fried',
    'steamed', 'braised', 'sautéed', 'poached', 'stuffed',
    // Sauce/preparation words
    'sauce', 'gravy', 'aioli', 'pesto', 'salsa', 'vinaigrette',
  ];

  // Check if query contains any dish connective words
  const hasDishConnectives = dishConnectives.some(connective =>
    lowerQuery.includes(` ${connective} `) ||
    lowerQuery.startsWith(`${connective} `) ||
    lowerQuery.endsWith(` ${connective}`)
  );

  if (hasDishConnectives) {
    return 'dish';
  }

  // 4. Check for dish type words (words that indicate a complete dish)
  const dishTypeWords = [
    // Main dish types
    'pasta', 'risotto', 'paella', 'biryani', 'tagine', 'casserole',
    'lasagna', 'lasagne', 'moussaka', 'wellington',
    // Soups/stews
    'soup', 'stew', 'chowder', 'bisque', 'consommé', 'bouillabaisse', 'gumbo',
    // Asian dishes
    'curry', 'stir-fry', 'ramen', 'pho', 'pad thai', 'dim sum', 'sushi', 'tempura',
    // Baked goods
    'cake', 'pie', 'tart', 'quiche', 'soufflé', 'flan', 'tarte',
    // Breakfast
    'omelette', 'omelet', 'frittata', 'pancake', 'waffle', 'crepe',
    // Other
    'salad', 'sandwich', 'burger', 'pizza', 'tacos', 'enchiladas', 'burrito',
  ];

  const hasDishTypeWord = dishTypeWords.some(dishWord =>
    lowerQuery.includes(dishWord)
  );

  if (hasDishTypeWord) {
    return 'dish';
  }

  // 5. Common multi-word dish patterns (famous dishes)
  const famousDishes = [
    'beef bourguignon', 'coq au vin', 'duck confit', 'boeuf bourguignon',
    'chicken tikka', 'butter chicken', 'chicken parmesan', 'chicken marsala',
    'fish tacos', 'fish chips', 'bangers mash', 'shepherd pie', 'cottage pie',
    'eggs benedict', 'french toast', 'club sandwich',
    'carbonara', 'bolognese', 'arrabiata', 'aglio olio', 'cacio pepe',
  ];

  if (famousDishes.some(dish => lowerQuery.includes(dish))) {
    return 'dish';
  }

  // 6. Check if it's clearly just a list of ingredients (common ingredient words)
  const commonIngredients = [
    // Proteins
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'turkey',
    'bacon', 'sausage', 'ham', 'duck', 'tofu', 'eggs', 'egg',
    // Protein cuts/types
    'breast', 'thigh', 'wing', 'drumstick', 'fillet', 'steak', 'chop', 'mince', 'ground',
    // Vegetables
    'broccoli', 'carrot', 'potato', 'tomato', 'onion', 'garlic', 'pepper', 'mushroom',
    'spinach', 'lettuce', 'cabbage', 'celery', 'zucchini', 'eggplant', 'cucumber',
    // Starches/Grains
    'rice', 'noodles', 'bread', 'flour', 'quinoa', 'couscous', 'beans', 'lentils',
    // Dairy
    'cheese', 'milk', 'cream', 'butter', 'yogurt',
    // Other
    'oil', 'salt', 'pepper', 'spices', 'herbs', 'stock', 'broth',
  ];

  // Count how many words are common ingredients
  const ingredientWordCount = words.filter(word =>
    commonIngredients.includes(word.toLowerCase())
  ).length;

  // If most/all words are common ingredients, treat as ingredient list
  if (wordCount >= 3 && ingredientWordCount >= Math.ceil(wordCount * 0.7)) {
    return 'ingredients';
  }

  // 7. If it's 2-3 words with no commas and no obvious ingredient markers, treat as dish
  if (wordCount <= 3) {
    return 'dish';
  }

  // 8. If 4+ words with no dish indicators, likely a list of ingredients
  return 'ingredients';
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
