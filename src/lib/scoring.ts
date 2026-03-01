import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getRecipeBySlug as getDbRecipeBySlug, updateRecipeScore } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Recipe scoring criteria and thresholds
 */
export const SCORING_CONFIG = {
  MIN_SCORE: 0,
  MAX_SCORE: 10,
  FEATURED_THRESHOLD: 7.0,
  REJECT_THRESHOLD: 3.0,
  MODEL: 'claude-haiku-4-5-20251001' as const,
};

export interface RecipeScore {
  score: number;
  reasoning: string;
  breakdown: {
    coherence: number;
    cookability: number;
    ingredientMatch: number;
    simplicity: number;
  };
}

/**
 * Score a recipe using Claude Haiku 4.5
 * Evaluates coherence, cookability, ingredient usage, and simplicity
 */
export async function scoreRecipe(recipeId: string): Promise<{
  success: boolean;
  score?: number;
  reasoning?: string;
  error?: string;
}> {
  try {
    // Fetch the recipe from database
    const recipe = await getDbRecipeBySlug(recipeId);
    if (!recipe) {
      return {
        success: false,
        error: 'Recipe not found',
      };
    }

    // Build scoring prompt
    const prompt = buildScoringPrompt(recipe);

    // Call Claude Haiku for scoring
    const message = await anthropic.messages.create({
      model: SCORING_CONFIG.MODEL,
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for more consistent scoring
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse response
    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const result = parseScoreResponse(textContent.text);

    // Update recipe in database
    const updateResult = await updateRecipeScore(recipe.id, result.score);
    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || 'Failed to update score',
      };
    }

    return {
      success: true,
      score: result.score,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('Error scoring recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build the scoring prompt for Claude
 */
function buildScoringPrompt(recipe: any): string {
  return `Score this recipe on a scale of 0-10 based on the following criteria:

1. **Coherence** (0-10): Does the recipe make sense? Are the ingredients and method logically connected?
2. **Cookability** (0-10): Can someone actually cook this? Are the instructions clear and practical?
3. **Ingredient Match** (0-10): Do the ingredients work well together? Is there good variety and balance?
4. **Simplicity** (0-10): Are the steps clear and easy to follow? Not overly complex?

Recipe to score:
**Title**: ${recipe.title}
**Description**: ${recipe.description}
**Ingredients**:
${recipe.ingredients.map((ing: string, i: number) => `${i + 1}. ${ing}`).join('\n')}

**Method**:
${recipe.method.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

**User Ingredients Used**: ${recipe.user_ingredients?.join(', ') || 'Not specified'}

Return ONLY a JSON object in this exact format:
{
  "coherence": 8.0,
  "cookability": 7.5,
  "ingredientMatch": 9.0,
  "simplicity": 8.5,
  "score": 8.25,
  "reasoning": "Brief explanation of the score (2-3 sentences)"
}

The overall score should be the average of the four criteria scores.`;
}

/**
 * Parse Claude's scoring response
 */
function parseScoreResponse(response: string): RecipeScore {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (
      typeof parsed.score !== 'number' ||
      typeof parsed.reasoning !== 'string' ||
      !parsed.coherence ||
      !parsed.cookability ||
      !parsed.ingredientMatch ||
      !parsed.simplicity
    ) {
      throw new Error('Invalid score format');
    }

    // Clamp score to valid range
    const score = Math.max(
      SCORING_CONFIG.MIN_SCORE,
      Math.min(SCORING_CONFIG.MAX_SCORE, parsed.score)
    );

    return {
      score: Math.round(score * 10) / 10, // Round to 1 decimal place
      reasoning: parsed.reasoning,
      breakdown: {
        coherence: parsed.coherence,
        cookability: parsed.cookability,
        ingredientMatch: parsed.ingredientMatch,
        simplicity: parsed.simplicity,
      },
    };
  } catch (error) {
    console.error('Error parsing score response:', error);
    console.error('Response was:', response);

    // Fallback: assign a neutral score if parsing fails
    return {
      score: 5.0,
      reasoning: 'Unable to parse score. Assigned neutral score.',
      breakdown: {
        coherence: 5,
        cookability: 5,
        ingredientMatch: 5,
        simplicity: 5,
      },
    };
  }
}

/**
 * Score a photo using Claude Vision
 */
export async function scorePhoto(photoUrl: string): Promise<{
  success: boolean;
  score?: number;
  isFood?: boolean;
  reasoning?: string;
  error?: string;
}> {
  try {
    const message = await anthropic.messages.create({
      model: SCORING_CONFIG.MODEL,
      max_tokens: 512,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: photoUrl,
              },
            },
            {
              type: 'text',
              text: `Is this a photo of food? If yes, score the photo quality on a scale of 0-10 based on:
- Appetizing appearance (is it well-presented and appealing?)
- Photo clarity (is it in focus and well-lit?)
- Recognizability (can you tell what the dish is?)

Return ONLY a JSON object:
{
  "isFood": true/false,
  "score": 8.5,
  "reasoning": "Brief explanation"
}

If it's not food, set score to 0.`,
            },
          ],
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and clamp score
    const score = parsed.isFood
      ? Math.max(0, Math.min(10, parsed.score || 0))
      : 0;

    return {
      success: true,
      score: Math.round(score * 10) / 10,
      isFood: parsed.isFood,
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Error scoring photo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Lazy-load OpenAI client
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
}

/**
 * Check photo authenticity using GPT-4o vision
 * Detects AI-generated images, stock photos, etc.
 */
export async function checkPhotoAuthenticity(photoUrl: string): Promise<{
  success: boolean;
  authenticity?: 'genuine' | 'suspicious' | 'likely_ai';
  confidence?: number;
  reason?: string;
  error?: string;
}> {
  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: photoUrl },
            },
            {
              type: 'text',
              text: `Is this photo likely to be AI-generated, a stock photo, or a genuine home-cooked meal photo taken by an amateur? Look for signs like perfect studio lighting, watermarks, stock photo composition, or AI artifacts. Respond with ONLY a JSON object: {"authenticity": "genuine" | "suspicious" | "likely_ai", "confidence": 0-100, "reason": "brief explanation"}`,
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from GPT-4o');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const validFlags = ['genuine', 'suspicious', 'likely_ai'];
    const authenticity = validFlags.includes(parsed.authenticity) ? parsed.authenticity : 'suspicious';
    const confidence = Math.max(0, Math.min(100, Math.round(parsed.confidence || 0)));

    return {
      success: true,
      authenticity,
      confidence,
      reason: parsed.reason || 'No reason provided',
    };
  } catch (error) {
    console.error('Error checking photo authenticity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
