import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get recent AI-generated recipes (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recipes, error: recipesError } = await supabase
      .from('generated_recipes')
      .select('slug, title, status, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent AI-generated guides
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('slug, title, status, created_at, source')
      .eq('source', 'ai-generated')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    const content = [
      ...(recipes || []).map((r) => ({ ...r, source: 'recipe' })),
      ...(guides || []).map((g) => ({ ...g, source: 'guide' })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in ai-generated-content endpoint:', error);
    return NextResponse.json({ content: [] });
  }
}
