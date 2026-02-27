import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/lib/claude';
import { createRecipe } from '@/lib/supabase';
import { validateGeneratedRecipe } from '@/lib/validation';
import {
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  SaveRecipeRequest,
  SaveRecipeResponse,
} from '@/types/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a save request
    if ('save' in body && body.save === true) {
      return handleSaveRecipe(body as SaveRecipeRequest);
    }

    // Otherwise, it's a generation request
    return handleGenerateRecipe(body as GenerateRecipeRequest);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

async function handleGenerateRecipe(
  body: GenerateRecipeRequest
): Promise<NextResponse<GenerateRecipeResponse>> {
  const { userIngredients, essentials } = body;

  // Validate input
  if (!Array.isArray(userIngredients) || userIngredients.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'At least one ingredient is required',
      },
      { status: 400 }
    );
  }

  if (userIngredients.length > 20) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many ingredients (maximum 20)',
      },
      { status: 400 }
    );
  }

  if (!Array.isArray(essentials)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Essentials must be an array',
      },
      { status: 400 }
    );
  }

  try {
    console.log('[Generate Recipe] Starting generation...');
    console.log('[Generate Recipe] User ingredients:', userIngredients);
    console.log('[Generate Recipe] Essentials count:', essentials.length);

    // Call Claude API to generate recipe
    const recipe = await generateRecipe(userIngredients, essentials);

    console.log('[Generate Recipe] Recipe generated successfully:', recipe.title);

    // Validate the generated recipe
    const validation = validateGeneratedRecipe(recipe);
    if (!validation.valid) {
      console.error('[Generate Recipe] Validation failed:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          error: `Generated recipe is invalid: ${validation.errors.join(', ')}`,
        },
        { status: 500 }
      );
    }

    console.log('[Generate Recipe] Validation passed');

    return NextResponse.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error('[Generate Recipe] ERROR:', error);
    console.error('[Generate Recipe] Error type:', error instanceof Error ? 'Error' : typeof error);
    console.error('[Generate Recipe] Error message:', error instanceof Error ? error.message : String(error));

    const errorMessage = error instanceof Error ? error.message : 'Recipe generation failed';

    // Check for specific error types
    if (errorMessage.includes('ANTHROPIC_API_KEY') || errorMessage.includes('not configured')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recipe generation service is not configured. Please check your API key.',
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('authentication_error') || errorMessage.includes('invalid x-api-key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key. Please check your Anthropic API key in .env.local',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate recipe: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

async function handleSaveRecipe(
  body: SaveRecipeRequest
): Promise<NextResponse<SaveRecipeResponse>> {
  const { recipe } = body;

  if (!recipe) {
    return NextResponse.json(
      {
        success: false,
        error: 'Recipe data is required',
      },
      { status: 400 }
    );
  }

  // Validate the recipe before saving
  const validation = validateGeneratedRecipe(recipe);
  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid recipe data: ${validation.errors.join(', ')}`,
      },
      { status: 400 }
    );
  }

  try {
    // Generate slug from title
    let slug = recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Add timestamp to ensure uniqueness
    slug = `${slug}-${Date.now().toString(36)}`;

    // Save the recipe to Supabase
    const result = await createRecipe({
      slug,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      method: recipe.method,
      user_ingredients: recipe.userIngredients || [],
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      serves: recipe.serves,
      difficulty: recipe.difficulty,
      budget: recipe.budget,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      vegetarian: recipe.vegetarian,
      vegan: recipe.vegan,
      dairy_free: recipe.dairyFree,
      gluten_free: recipe.glutenFree,
      student_kitchen: recipe.studentKitchen,
      tags: recipe.tags,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to save recipe',
        },
        { status: 500 }
      );
    }

    // Trigger async scoring (don't await - fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/score-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: result.data.id }),
    }).catch((err) => {
      console.error('Failed to trigger scoring:', err);
    });

    return NextResponse.json({
      success: true,
      slug: result.data.slug,
    });
  } catch (error) {
    console.error('Recipe save error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save recipe. Please try again.',
      },
      { status: 500 }
    );
  }
}
