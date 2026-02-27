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
  essentials: string[]
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
  const prompt = `You are a creative chef helping someone cook with what they have.

The user has these ingredients:
${userIngredients.map(i => `- ${i}`).join('\n')}

Assume they also have these pantry basics:
${essentials.map(e => `- ${e}`).join('\n')}

Generate a realistic, delicious recipe using primarily the user's ingredients.

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

Return ONLY valid JSON (no markdown, no preamble, no code blocks):
{
  "title": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["precise measurements"],
  "method": ["Step 1", "Step 2"],
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
  "tags": ["main", "dinner"]
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
