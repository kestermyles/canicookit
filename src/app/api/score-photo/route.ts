import { NextRequest, NextResponse } from 'next/server';
import { scorePhoto, checkPhotoAuthenticity } from '@/lib/scoring';
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

    // Run quality scoring and authenticity check in parallel
    const [result, authResult] = await Promise.all([
      scorePhoto(photoUrl),
      checkPhotoAuthenticity(photoUrl),
    ]);

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
      'isFood:', result.isFood,
      'score:', result.score,
      'authenticity:', authResult.authenticity,
      'confidence:', authResult.confidence
    );

    // Update photo record with score and authenticity
    if (photoId) {
      const supabase = getServiceClient();

      // Determine status: flagged overrides normal logic
      const isFlaggedAi =
        authResult.success &&
        authResult.authenticity === 'likely_ai' &&
        authResult.confidence !== undefined &&
        authResult.confidence > 80;

      let status: string;
      if (isFlaggedAi) {
        status = 'flagged';
      } else if (result.isFood && result.score && result.score >= MIN_PHOTO_SCORE) {
        status = 'approved';
      } else {
        status = 'rejected';
      }

      await supabase
        .from('recipe_photos')
        .update({
          quality_score: result.score,
          status,
          ...(authResult.success && {
            authenticity_score: authResult.confidence,
            authenticity_flag: authResult.authenticity,
          }),
        })
        .eq('id', photoId);

      // If photo scored high and not flagged, update recipe hero image
      if (
        status === 'approved' &&
        recipeSlug &&
        result.score &&
        result.score >= MIN_PHOTO_SCORE
      ) {
        console.log(
          '[Score Photo] Photo scored high, updating recipe image and replacing AI image'
        );
        await updateRecipePhoto(recipeSlug, photoUrl, false);
      }
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      isFood: result.isFood,
      reasoning: result.reasoning,
      authenticity: authResult.success ? authResult.authenticity : undefined,
      authenticityConfidence: authResult.success ? authResult.confidence : undefined,
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
