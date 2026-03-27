import { NextResponse } from 'next/server';
import { supabase, createRecipe, getRecipePhotos, getComments, deleteRecipe } from '@/lib/supabase';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(request: Request) {
  try {
    const {
      originalSlug,
      originalTitle,
      originalDescription,
      originalIngredients,
      originalMethod,
      adaptations,
      authorName,
    } = await request.json();

    if (!originalTitle || !adaptations || !authorName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Call Claude to adapt the recipe
    const prompt = `You are adapting an existing recipe based on a user's requested changes. Think through how each change affects the method, timings, and other ingredients — don't just swap names.

Original recipe:
Title: ${originalTitle}
Description: ${originalDescription}
Ingredients: ${(originalIngredients || []).join(', ')}
Method: ${(originalMethod || []).join('\n')}

The user wants these changes:
${adaptations}

Create an adapted version of this recipe.

Title format: "${authorName}'s take on ${originalTitle}"
Description format: "Fresh from ${authorName}'s kitchen — inspired by ${originalTitle}. [explain what makes this version unique in one sentence]"

Always round temperatures to the nearest 5 or 10 degrees. Use 400°F not 392°F. Use 200°C not 193°C.

Return ONLY valid JSON (no markdown, no preamble, no code blocks):
{
  "title": "${authorName}'s take on ${originalTitle}",
  "description": "Fresh from ${authorName}'s kitchen — inspired by ${originalTitle}. ...",
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
      console.error('[Adapt Recipe] Claude API error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Failed to create your version' },
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

    const recipe = JSON.parse(jsonText);

    // Check for existing recipe with the same title to prevent duplicates
    const { data: existing } = await supabase
      .from('generated_recipes')
      .select('slug')
      .eq('title', recipe.title)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, slug: existing.slug });
    }

    // Generate slug
    const timestamp = Date.now().toString(36);
    const slug = `${slugify(recipe.title)}-${timestamp}`;

    // Cleanup: check if original has photos or comments
    if (originalSlug) {
      try {
        const [photos, comments] = await Promise.all([
          getRecipePhotos(originalSlug),
          getComments(originalSlug),
        ]);

        if (photos.length === 0 && comments.length === 0) {
          await deleteRecipe(originalSlug);
        }
      } catch (err) {
        console.error('[Adapt Recipe] Cleanup check failed:', err);
        // Continue anyway — saving the new recipe is more important
      }
    }

    // Save to database
    const { success, error: saveError } = await createRecipe({
      slug,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      method: recipe.method,
      user_ingredients: originalIngredients,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      serves: recipe.serves,
      difficulty: recipe.difficulty,
      budget: recipe.budget || 'reasonable',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      vegetarian: recipe.vegetarian || false,
      vegan: recipe.vegan || false,
      dairy_free: recipe.dairyFree || false,
      gluten_free: recipe.glutenFree || false,
      student_kitchen: recipe.studentKitchen || false,
      tags: recipe.tags || ['dinner'],
      user_name: authorName,
    });

    if (!success) {
      throw new Error(saveError || 'Failed to save recipe');
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[Adapt Recipe] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
