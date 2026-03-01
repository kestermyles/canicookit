import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('recipe_photos')
      .select('id, recipe_slug, photo_url, quality_score, status, created_at, uploaded_by_name, authenticity_score, authenticity_flag')
      .eq('status', 'flagged')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch recipe titles for each flagged photo
    const slugs = [...new Set((data || []).map((p) => p.recipe_slug))];
    const { data: recipes } = await supabase
      .from('generated_recipes')
      .select('slug, title')
      .in('slug', slugs);

    const titleMap = new Map((recipes || []).map((r) => [r.slug, r.title]));

    const photos = (data || []).map((photo) => ({
      ...photo,
      recipe_title: titleMap.get(photo.recipe_slug) || photo.recipe_slug,
    }));

    return NextResponse.json({ success: true, photos });
  } catch (error) {
    console.error('[Admin] Error fetching flagged photos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flagged photos' },
      { status: 500 }
    );
  }
}
