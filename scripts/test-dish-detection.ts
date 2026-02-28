// Test the dish name detection logic

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

  // 3. Check for dish name connective words
  const dishConnectives = [
    'alla', 'au', 'aux', 'de', 'del', 'della', 'le', 'la', 'el', 'à', 'a la', 'al',
    'with', 'and', 'in', 'on', 'of', '&',
    'pie', 'tart', 'soup', 'stew', 'curry', 'roast', 'grilled', 'baked', 'fried',
    'steamed', 'braised', 'sautéed', 'poached', 'stuffed',
    'sauce', 'gravy', 'aioli', 'pesto', 'salsa', 'vinaigrette',
  ];

  const hasDishConnectives = dishConnectives.some(connective =>
    lowerQuery.includes(` ${connective} `) ||
    lowerQuery.startsWith(`${connective} `) ||
    lowerQuery.endsWith(` ${connective}`)
  );

  if (hasDishConnectives) {
    return 'dish';
  }

  // 4. Check for dish type words
  const dishTypeWords = [
    'pasta', 'risotto', 'paella', 'biryani', 'tagine', 'casserole',
    'lasagna', 'lasagne', 'moussaka', 'wellington',
    'soup', 'stew', 'chowder', 'bisque', 'consommé', 'bouillabaisse', 'gumbo',
    'curry', 'stir-fry', 'ramen', 'pho', 'pad thai', 'dim sum', 'sushi', 'tempura',
    'cake', 'pie', 'tart', 'quiche', 'soufflé', 'flan', 'tarte',
    'omelette', 'omelet', 'frittata', 'pancake', 'waffle', 'crepe',
    'salad', 'sandwich', 'burger', 'pizza', 'tacos', 'enchiladas', 'burrito',
  ];

  const hasDishTypeWord = dishTypeWords.some(dishWord =>
    lowerQuery.includes(dishWord)
  );

  if (hasDishTypeWord) {
    return 'dish';
  }

  // 5. Common multi-word dish patterns
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

  // 6. Check if it's clearly just a list of ingredients
  const commonIngredients = [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'turkey',
    'bacon', 'sausage', 'ham', 'duck', 'tofu', 'eggs', 'egg',
    'breast', 'thigh', 'wing', 'drumstick', 'fillet', 'steak', 'chop', 'mince', 'ground',
    'broccoli', 'carrot', 'potato', 'tomato', 'onion', 'garlic', 'pepper', 'mushroom',
    'spinach', 'lettuce', 'cabbage', 'celery', 'zucchini', 'eggplant', 'cucumber',
    'rice', 'noodles', 'bread', 'flour', 'quinoa', 'couscous', 'beans', 'lentils',
    'cheese', 'milk', 'cream', 'butter', 'yogurt',
    'oil', 'salt', 'pepper', 'spices', 'herbs', 'stock', 'broth',
  ];

  const ingredientWordCount = words.filter(word =>
    commonIngredients.includes(word.toLowerCase())
  ).length;

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

const testCases = [
  // User-provided examples
  { input: 'spaghetti alla vongole', expected: 'dish', reason: 'has "alla"' },
  { input: 'chicken rice garlic', expected: 'ingredients', reason: '3 words, no connectives' },
  { input: 'beef bourguignon', expected: 'dish', reason: 'famous dish' },
  { input: 'chicken, rice, garlic', expected: 'ingredients', reason: 'has commas' },

  // Additional test cases
  { input: 'carbonara', expected: 'dish', reason: 'single word dish' },
  { input: 'chicken tikka masala', expected: 'dish', reason: 'famous dish with "tikka"' },
  { input: 'chicken breast broccoli', expected: 'ingredients', reason: '3 words, no connectives' },
  { input: 'chicken with mushrooms', expected: 'dish', reason: 'has "with"' },
  { input: 'beef and broccoli', expected: 'dish', reason: 'has "and"' },
  { input: 'fish tacos', expected: 'dish', reason: 'contains "tacos"' },
  { input: 'chicken soup', expected: 'dish', reason: 'contains "soup"' },
  { input: 'chocolate cake', expected: 'dish', reason: 'contains "cake"' },
  { input: 'tuna pasta bake', expected: 'dish', reason: 'contains "pasta" and "baked"' },
  { input: 'shepherd pie', expected: 'dish', reason: 'famous dish with "pie"' },
  { input: 'eggs benedict', expected: 'dish', reason: 'famous dish' },
  { input: 'french toast', expected: 'dish', reason: 'famous dish' },
  { input: 'chicken parmesan', expected: 'dish', reason: 'famous dish' },
  { input: 'beef stew', expected: 'dish', reason: 'contains "stew"' },
  { input: 'mushroom risotto', expected: 'dish', reason: 'contains "risotto"' },
  { input: 'chicken curry', expected: 'dish', reason: 'contains "curry"' },
  { input: 'apple pie', expected: 'dish', reason: 'contains "pie"' },
  { input: 'caesar salad', expected: 'dish', reason: 'contains "salad"' },
];

console.log('🧪 Testing Dish Name Detection\n');

let passed = 0;
let failed = 0;

testCases.forEach((test) => {
  const result = detectInputType(test.input);
  const success = result === test.expected;

  if (success) {
    console.log(`✅ "${test.input}" → ${result} (${test.reason})`);
    passed++;
  } else {
    console.log(`❌ "${test.input}" → ${result} (expected ${test.expected}) - ${test.reason}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('✨ All tests passed!');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} test(s) failed`);
  process.exit(1);
}
