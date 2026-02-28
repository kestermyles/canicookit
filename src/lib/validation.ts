import { GeneratedRecipeData } from '@/types/generator';
import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid initialization errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface InputValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates user input before generating a recipe
 * Uses GPT-4o-mini to check if input is a genuine cooking request
 * Rejects non-food items, offensive content, nonsense, etc.
 */
export async function validateUserInput(
  userIngredients: string[],
  essentials: string[]
): Promise<InputValidationResult> {
  try {
    // Combine all inputs
    const allInputs = [...userIngredients, ...essentials];

    // Quick check: reject if no inputs
    if (allInputs.length === 0) {
      return {
        valid: false,
        reason: 'Please enter at least one ingredient or dish name',
      };
    }

    // Quick check: single word that's clearly not food
    if (allInputs.length === 1 && allInputs[0].split(/\s+/).length === 1) {
      const singleWord = allInputs[0].toLowerCase().trim();
      // Allow common single-word ingredients
      const commonIngredients = [
        'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'cod',
        'eggs', 'rice', 'pasta', 'bread', 'cheese', 'milk', 'butter',
        'flour', 'sugar', 'salt', 'pepper', 'garlic', 'onion', 'tomato',
        'potato', 'carrot', 'broccoli', 'spinach', 'mushroom', 'bacon',
        'sausage', 'shrimp', 'tofu', 'beans', 'lentils', 'quinoa',
      ];

      if (!commonIngredients.includes(singleWord)) {
        // Let GPT-4 decide if it's food-related
      } else {
        return { valid: true };
      }
    }

    // Use GPT-4o-mini for cost-effective validation
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a food input validator. Determine if the user's input is a genuine cooking request.

Valid inputs include:
- Real food ingredients (e.g., "chicken", "tomatoes", "pasta")
- Real dish names (e.g., "carbonara", "curry", "stir fry")
- Combinations of ingredients or dishes

Invalid inputs include:
- Non-food items (e.g., "car", "laptop", "shoes")
- Offensive or inappropriate content
- Nonsense or gibberish (e.g., "asdfgh", "xyz123")
- Single generic words that aren't food (e.g., "thing", "stuff")

Respond with JSON only:
{"valid": true} or {"valid": false, "reason": "brief explanation"}`,
        },
        {
          role: 'user',
          content: `Validate this cooking input: ${allInputs.join(', ')}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      // If validation fails, allow it through (fail open)
      return { valid: true };
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If we can't parse, allow through
      return { valid: true };
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.valid) {
      return {
        valid: false,
        reason: result.reason || 'Input does not appear to be food-related',
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Input Validation] Error:', error);
    // Fail open - if validation errors, allow the request through
    return { valid: true };
  }
}

/**
 * Validates a generated recipe to ensure all required fields are present
 * and values are within acceptable ranges
 */
export function validateGeneratedRecipe(data: any): ValidationResult {
  const errors: string[] = [];

  // Required string fields
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  }
  if (!data.cuisine || typeof data.cuisine !== 'string') {
    errors.push('Cuisine is required');
  }

  // Required array fields
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    errors.push('Ingredients array is required and must not be empty');
  }
  if (!Array.isArray(data.method) || data.method.length === 0) {
    errors.push('Method array is required and must not be empty');
  }
  if (!Array.isArray(data.userIngredients)) {
    errors.push('User ingredients array is required');
  }
  if (!Array.isArray(data.tags)) {
    errors.push('Tags array is required');
  }

  // Difficulty validation
  const validDifficulties = ['easy', 'getting-somewhere', 'weekend-cook'];
  if (!validDifficulties.includes(data.difficulty)) {
    errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  // Budget validation
  const validBudgets = ['cheap', 'reasonable', 'splash-out'];
  if (!validBudgets.includes(data.budget)) {
    errors.push(`Budget must be one of: ${validBudgets.join(', ')}`);
  }

  // Numeric fields with ranges
  if (typeof data.prepTime !== 'number' || data.prepTime < 0 || data.prepTime > 120) {
    errors.push('Prep time must be a number between 0 and 120 minutes');
  }
  if (typeof data.cookTime !== 'number' || data.cookTime < 0 || data.cookTime > 300) {
    errors.push('Cook time must be a number between 0 and 300 minutes');
  }
  if (typeof data.serves !== 'number' || data.serves < 1 || data.serves > 20) {
    errors.push('Serves must be a number between 1 and 20');
  }

  // Nutrition validation
  if (typeof data.calories !== 'number' || data.calories < 0 || data.calories > 5000) {
    errors.push('Calories must be a number between 0 and 5000');
  }
  if (typeof data.protein !== 'number' || data.protein < 0 || data.protein > 500) {
    errors.push('Protein must be a number between 0 and 500g');
  }
  if (typeof data.carbs !== 'number' || data.carbs < 0 || data.carbs > 500) {
    errors.push('Carbs must be a number between 0 and 500g');
  }
  if (typeof data.fat !== 'number' || data.fat < 0 || data.fat > 500) {
    errors.push('Fat must be a number between 0 and 500g');
  }

  // Boolean fields
  const booleanFields = ['vegetarian', 'vegan', 'dairyFree', 'glutenFree', 'studentKitchen'];
  for (const field of booleanFields) {
    if (typeof data[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
