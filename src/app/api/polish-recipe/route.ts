import { NextResponse } from 'next/server';
import { checkIngredientBlocklist } from '@/lib/moderation';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

export async function POST(request: Request) {
  try {
    const { title, authorName, description, ingredients, method, serves, cookTime, difficulty } =
      await request.json();

    if (!title || !description || !ingredients?.length || !method) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Check ingredients against blocklist
    const blockCheck = checkIngredientBlocklist(ingredients);
    if (!blockCheck.safe) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more ingredients don't look right — please check your list and try again.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Service not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are helping a home cook share their recipe with a community. Lightly polish the following recipe submission — fix any spelling or typos, tidy up punctuation and capitalisation, and reorder any steps that are out of sequence. Do NOT change any ingredients, quantities, or the essence of the recipe. Preserve the author's voice and personality — this should still sound like them, just cleaned up.

Also check if the recipe contains any inappropriate content, offensive language, or anything unsuitable for a family-friendly cooking website. If it does, return ONLY: { "flagged": true, "reason": "brief explanation" }

Recipe submission:
Title: ${title}
Author: ${authorName}
Description: ${description}
Ingredients: ${ingredients.join(', ')}
Method: ${method}
Serves: ${serves || 4}
Cook time: ${cookTime || 30} minutes
Difficulty: ${difficulty || 'easy'}

Always round temperatures to the nearest 5 or 10 degrees.

If the recipe is appropriate, return ONLY valid JSON (no markdown, no preamble, no code blocks):
{
  "title": "Polished recipe title",
  "description": "Polished description",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
  "method": "1. First step\\n2. Second step\\n3. Third step",
  "serves": 4,
  "cookTime": 30,
  "difficulty": "easy",
  "vegetarian": false,
  "vegan": false,
  "dairyFree": false,
  "glutenFree": false,
  "calories": 400,
  "protein": 25,
  "carbs": 40,
  "fat": 15,
  "tags": ["dinner"]
}`;

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('[Polish Recipe] Claude API error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Failed to polish recipe' },
        { status: 500 }
      );
    }

    const data = await response.json();
    let jsonText = data.content?.[0]?.text?.trim() || '';

    // Strip markdown code blocks
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const polished = JSON.parse(jsonText);

    // Check if content was flagged as inappropriate
    if (polished.flagged) {
      console.log('[Polish Recipe] Content flagged:', polished.reason);
      return NextResponse.json(
        {
          success: false,
          error: "Your recipe contains some content we can't publish — please review and resubmit.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, recipe: polished });
  } catch (error) {
    console.error('[Polish Recipe] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
