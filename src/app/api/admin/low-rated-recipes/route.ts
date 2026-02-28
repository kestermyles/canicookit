import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get recipes with low average ratings (under 2 stars) and at least 3 ratings
    const { data, error } = await supabase
      .from('recipe_ratings')
      .select('recipe_slug, rating')
      .order('recipe_slug');

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json({ recipes: [] });
    }

    // Calculate averages
    const ratingsBySlug = new Map<string, number[]>();
    data?.forEach((rating) => {
      if (!ratingsBySlug.has(rating.recipe_slug)) {
        ratingsBySlug.set(rating.recipe_slug, []);
      }
      ratingsBySlug.get(rating.recipe_slug)!.push(rating.rating);
    });

    // Filter for low ratings (< 2 stars with 3+ ratings)
    const lowRatedSlugs: Array<{ slug: string; average: number; count: number }> = [];
    ratingsBySlug.forEach((ratings, slug) => {
      if (ratings.length >= 3) {
        const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        if (average < 2) {
          lowRatedSlugs.push({ slug, average, count: ratings.length });
        }
      }
    });

    // Get recipe details
    if (lowRatedSlugs.length === 0) {
      return NextResponse.json({ recipes: [] });
    }

    const { data: recipes } = await supabase
      .from('generated_recipes')
      .select('slug, title')
      .in('slug', lowRatedSlugs.map((r) => r.slug));

    const result = lowRatedSlugs.map((rating) => {
      const recipe = recipes?.find((r) => r.slug === rating.slug);
      return {
        slug: rating.slug,
        title: recipe?.title || 'Unknown',
        average_rating: rating.average,
        rating_count: rating.count,
      };
    });

    return NextResponse.json({ recipes: result });
  } catch (error) {
    console.error('Error in low-rated-recipes endpoint:', error);
    return NextResponse.json({ recipes: [] });
  }
}
