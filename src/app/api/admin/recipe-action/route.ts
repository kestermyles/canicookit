import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { slug, action } = await request.json();

    if (!slug || !action) {
      return NextResponse.json({ success: false, error: 'Missing slug or action' }, { status: 400 });
    }

    switch (action) {
      case 'approve':
        // Unflag the recipe
        await supabase
          .from('generated_recipes')
          .update({ flagged: false })
          .eq('slug', slug);
        break;

      case 'hide':
        // Set status to rejected (hidden from public)
        await supabase
          .from('generated_recipes')
          .update({ status: 'rejected' })
          .eq('slug', slug);
        break;

      case 'delete':
        // Delete the recipe
        await supabase
          .from('generated_recipes')
          .delete()
          .eq('slug', slug);
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in recipe-action endpoint:', error);
    return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
  }
}
