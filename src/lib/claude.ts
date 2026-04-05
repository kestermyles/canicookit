import { GeneratedRecipeData } from '@/types/generator';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  id: string;
  model: string;
  role: 'assistant';
  stop_reason: string;
}

/**
 * Generates a recipe using Claude API based on user ingredients and pantry essentials
 * @param userIngredients - List of ingredients provided by the user
 * @param essentials - List of pantry basics assumed to be available
 * @returns Generated recipe data
 * @throws Error if API call fails or returns invalid data
 */
export async function generateRecipe(
  userIngredients: string[],
  essentials: string[],
  preferences?: { cookingMethod?: string; cuisinePreference?: string; mealVibe?: string; extraPreferences?: string; freeformDescription?: string }
): Promise<GeneratedRecipeData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log('[Claude API] Checking API key...');
  console.log('[Claude API] API key exists:', !!apiKey);
  console.log('[Claude API] API key starts with:', apiKey?.substring(0, 20));
  console.log('[Claude API] API key length:', apiKey?.length);

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  if (!apiKey.startsWith('sk-ant-api03-')) {
    throw new Error('ANTHROPIC_API_KEY has invalid format (should start with sk-ant-api03-)');
  }

  // Build the prompt
  const freeform = preferences?.freeformDescription;

  const userInputSection = freeform
    ? `The user has described what they want to make:
"${freeform}"

Generate a recipe that exactly matches this description. Honour every detail they have given — the specific dish, the character they describe (e.g. "traditional", "lovely", "comforting", "impressive"), and any constraints. Do not reinterpret or substitute. If they say "traditional English lemon curd", make a traditional English lemon curd — not a cake, tart, or variation.`
    : `The user has entered:
${userIngredients.map(i => `- ${i}`).join('\n')}

Carefully analyse what the user has entered. There are three distinct cases:

CASE 1 - The user has entered a specific dish or recipe name (e.g. "lemon curd", "beef ragu", "chocolate chip cookies", "pad thai", "tarte tatin", "carbonara"). Generate EXACTLY that dish. The title must be the dish they named. Do not reinterpret it as a variation — lemon curd means lemon curd, not lemon curd cake. Beef ragu means beef ragu, not a pasta bake. Use traditional ingredients and method for that specific dish. Do not deviate.

CASE 2 - The user has entered raw ingredients only (e.g. "chicken, peppers, garlic"). Create an original recipe that uses those as the main ingredients.

CASE 3 - The user has entered a mix of dish names and raw ingredients (e.g. "lemon curd, almonds"). Generate a recipe for the named dish and incorporate the loose ingredients where they naturally fit — in this example, an almond lemon curd.

If any ingredient or dish name appears to be misspelled, interpret it as the most likely intended ingredient or dish.`;

  const prompt = `You are a creative chef helping someone cook with what they have.

${userInputSection}

Assume they also have these pantry basics available — but use good judgement. Only reach for pantry items that genuinely suit the dish you are creating. A British chicken pie should not contain soy sauce or cumin just because they are in the pantry list. An Italian pasta dish should not contain worcestershire sauce. A Thai curry should not use red wine vinegar. Match pantry items to the dish's cuisine and character. When in doubt, leave it out.

${essentials.map(e => `- ${e}`).join('\n')}

Generate a realistic, delicious recipe.

Always round temperatures to the nearest 5 or 10 degrees. Use 400°F not 392°F. Use 350°F not 356°F. Use 200°C not 193°C. Use 180°C not 182°C.

Cooking quality rules:
- Carrots should be cut into batons or rough chunks, never rounds or coins
- Leafy greens (chard, kale, cavolo nero, spring greens etc): always sauté stalks first for 2 minutes, then add the leaves
- Fish always needs proper seasoning — at minimum salt, pepper and lemon, ideally a spice rub or herb crust
- For fish dishes, if serving with couscous, the couscous should include lemon zest and fresh herbs
- When a recipe has multiple components (protein + sides), present them as separate clearly labelled sections in the method e.g. "For the couscous:", "For the carrots:", "For the salmon:" — not one continuous method

CRITICAL: The recipe must exactly match its title. If the title contains an ingredient, that ingredient must appear in the ingredients list. If the title describes a cooking method (fried, roasted, grilled, baked, steamed, sautéed, braised, poached, etc.), that method must be used in the steps. For example, if the title says "fried rice", rice must be in the ingredients AND there must be a step that fries the rice. Never generate a recipe that contradicts its title.
${preferences?.cookingMethod ? `\nPreferred cooking method: ${preferences.cookingMethod}` : ''}${preferences?.cuisinePreference ? `\nPreferred cuisine style: ${preferences.cuisinePreference}` : ''}${preferences?.mealVibe ? `\nMeal vibe: ${preferences.mealVibe}` : ''}${preferences?.extraPreferences ? `\nExtra requests: ${preferences.extraPreferences}` : ''}
Requirements:
- Title should be descriptive and appetizing
- Prep time: 5-30 minutes (realistic)
- Cook time: 10-60 minutes (realistic)
- Serves: 2-4 people
- Difficulty: "easy" for simple recipes, "getting-somewhere" for intermediate, "weekend-cook" for complex
- Budget: "cheap" (<$10), "reasonable" ($10-20), "splash-out" (>$20)
- Provide accurate nutrition estimates per serving
- Mark dietary attributes (vegetarian, vegan, dairy-free, gluten-free)
- Student kitchen: true if doable with basic equipment (pot, pan, knife, spoon)
- Method: Clear numbered steps
- Cuisine should be "generated" for generated recipes
- Always include the cuisine type as a tag (e.g. 'italian', 'asian', 'mexican', 'british', 'french', 'indian', 'american') so recipes appear in the correct cuisine section
- Include 3-4 optional "flavour boosters" — spices, seasonings, or condiments that would elevate the dish based on the cuisine and ingredients (e.g. for Asian: sesame oil, chilli flakes, ginger). These are suggestions the user might add, not required.

Return ONLY valid JSON (no markdown, no preamble, no code blocks):
{
  "title": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["precise measurements"],
  "method": ["Step 1", "Step 2"],
  "flavourBoosters": ["smoked paprika", "fresh thyme", "chilli flakes"],
  "prepTime": 15,
  "cookTime": 20,
  "serves": 4,
  "difficulty": "easy",
  "budget": "cheap",
  "calories": 350,
  "protein": 25,
  "carbs": 40,
  "fat": 12,
  "vegetarian": false,
  "vegan": false,
  "dairyFree": true,
  "glutenFree": false,
  "studentKitchen": true,
  "tags": ["italian", "main", "dinner"]
}`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    const data: ClaudeResponse = await response.json();
    const textContent = data.content[0]?.text;

    if (!textContent) {
      throw new Error('No content received from Claude API');
    }

    // Claude sometimes wraps JSON in markdown code blocks, strip them
    let jsonText = textContent.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let recipeData: any;
    try {
      recipeData = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse Claude response as JSON: ${parseError}`);
    }

    // Add required fields that aren't in the base response
    const generatedRecipe: GeneratedRecipeData = {
      ...recipeData,
      slug: '', // Will be generated during save
      cuisine: 'generated',
      heroImage: '',
      images: [],
      videoUrl: '',
      userIngredients,
    };

    return generatedRecipe;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Recipe generation failed: ${error.message}`);
    }
    throw new Error('Recipe generation failed with unknown error');
  }
}
