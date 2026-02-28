import { NextRequest, NextResponse } from 'next/server';
import { scorePhoto } from '@/lib/scoring';
import { updateRecipePhoto, getServiceClient } from '@/lib/supabase';

const MIN_PHOTO_SCORE = 6.0; // Minimum score to become recipe hero image

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoUrl, photoId, recipeSlug } = body;

    if (!photoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Photo URL is required',
        },
        { status: 400 }
      );
    }

    console.log('[Score Photo] Starting photo analysis:', photoUrl);

    // Score the photo using Claude Vision
    const result = await scorePhoto(photoUrl);

    if (!result.success) {
      console.error('[Score Photo] Scoring failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to score photo',
        },
        { status: 500 }
      );
    }

    console.log(
      '[Score Photo] Analysis complete:',
      'isFood:',
      result.isFood,
      'score:',
      result.score
    );

    // Update photo record with score
    if (photoId) {
      const supabase = getServiceClient();
      const status =
        result.isFood && result.score && result.score >= MIN_PHOTO_SCORE
          ? 'approved'
          : 'rejected';

      await supabase
        .from('recipe_photos')
        .update({
          quality_score: result.score,
          status: status,
        })
        .eq('id', photoId);

      // If photo scored high enough, update recipe hero image
      if (
        status === 'approved' &&
        recipeSlug &&
        result.score &&
        result.score >= MIN_PHOTO_SCORE
      ) {
        console.log(
          '[Score Photo] Photo scored high, updating recipe image and replacing AI image'
        );
        // Pass false to mark this as a real photo (not AI-generated)
        await updateRecipePhoto(recipeSlug, photoUrl, false);
      }
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      isFood: result.isFood,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error('[Score Photo] ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
