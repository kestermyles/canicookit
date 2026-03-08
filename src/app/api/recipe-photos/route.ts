import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('recipe_photos')
      .select('*')
      .eq('recipe_slug', slug)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Recipe Photos] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, photos: data || [] });
  } catch (error) {
    console.error('[Recipe Photos] ERROR:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch photos' }, { status: 500 });
  }
}
