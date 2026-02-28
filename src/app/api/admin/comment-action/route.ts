import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { commentId, action } = await request.json();

    if (!commentId || !action) {
      return NextResponse.json({ success: false, error: 'Missing commentId or action' }, { status: 400 });
    }

    switch (action) {
      case 'approve':
        await supabase
          .from('comments')
          .update({ status: 'approved' })
          .eq('id', commentId);
        break;

      case 'reject':
        await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in comment-action endpoint:', error);
    return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
  }
}
