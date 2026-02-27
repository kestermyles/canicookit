import { NextRequest, NextResponse } from 'next/server';
import { scoreRecipe } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recipe ID is required',
        },
        { status: 400 }
      );
    }

    console.log('[Score Recipe] Starting scoring for:', recipeId);

    // Score the recipe using Claude Haiku
    const result = await scoreRecipe(recipeId);

    if (!result.success) {
      console.error('[Score Recipe] Scoring failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to score recipe',
        },
        { status: 500 }
      );
    }

    console.log(
      '[Score Recipe] Scoring complete:',
      result.score,
      'Reasoning:',
      result.reasoning
    );

    return NextResponse.json({
      success: true,
      score: result.score,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error('[Score Recipe] ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
