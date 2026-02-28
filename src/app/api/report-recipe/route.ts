import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
    }

    // Flag the recipe for admin review
    const { error } = await supabase
      .from('generated_recipes')
      .update({ flagged: true })
      .eq('slug', slug);

    if (error) {
      console.error('Error flagging recipe:', error);
      return NextResponse.json({ success: false, error: 'Failed to flag recipe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in report-recipe endpoint:', error);
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
  }
}
