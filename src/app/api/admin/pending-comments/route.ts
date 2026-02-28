import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, recipe_slug, name, comment, created_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching pending comments:', error);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('Error in pending-comments endpoint:', error);
    return NextResponse.json({ comments: [] });
  }
}
