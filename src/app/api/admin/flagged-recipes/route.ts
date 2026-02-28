import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get flagged community recipes
    const { data, error } = await supabase
      .from('generated_recipes')
      .select('id, slug, title, cuisine, created_at, status, flagged')
      .eq('flagged', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flagged recipes:', error);
      return NextResponse.json({ recipes: [] });
    }

    const recipes = (data || []).map((r) => ({
      ...r,
      source: 'community',
    }));

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error in flagged-recipes endpoint:', error);
    return NextResponse.json({ recipes: [] });
  }
}
