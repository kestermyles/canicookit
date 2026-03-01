import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { scorePhoto, checkPhotoAuthenticity } from '@/lib/scoring';
import { updateRecipePhoto, getServiceClient } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

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

      // Send alert email for flagged photos
      if (isFlaggedAi) {
        // Fetch recipe title
        const { data: recipe } = await supabase
          .from('generated_recipes')
          .select('title')
          .eq('slug', recipeSlug)
          .single();

        resend.emails.send({
          from: 'Can I Cook It <hello@canicookit.com>',
          to: 'hello@canicookit.com',
          subject: `Flagged photo: likely AI-generated (${authResult.confidence}% confidence)`,
          html: `<div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #ea580c;">Flagged Photo Alert</h2>
            <p>A photo has been flagged as likely AI-generated.</p>
            <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
              <tr><td style="padding: 8px; font-weight: bold;">Recipe</td><td style="padding: 8px;">${recipe?.title || recipeSlug}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Confidence</td><td style="padding: 8px;">${authResult.confidence}%</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Reason</td><td style="padding: 8px;">${authResult.reason}</td></tr>
            </table>
            <p><a href="${photoUrl}" style="color: #ea580c;">View photo</a></p>
            <p><a href="https://canicookit.com/admin/flagged-photos" style="color: #ea580c;">Review flagged photos</a></p>
          </div>`,
        }).catch((err) => console.error('[Score Photo] Failed to send flag email:', err));
      }

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
