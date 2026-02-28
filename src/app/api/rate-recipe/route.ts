import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { recipeSlug, rating } = await request.json();

    if (!recipeSlug || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Valid recipe slug and rating (1-5) are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { error } = await supabase.from('recipe_ratings').insert({
      recipe_slug: recipeSlug,
      user_id: null,
      rating: rating,
    });

    if (error) {
      console.error('Error saving anonymous rating:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rate recipe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
