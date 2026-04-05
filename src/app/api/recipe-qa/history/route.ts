import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ questions: [] });

  const { data, error } = await supabase
    .from('recipe_questions')
    .select('question, answer, created_at')
    .eq('recipe_slug', slug)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ questions: [] });
  return NextResponse.json({ questions: data || [] });
}
