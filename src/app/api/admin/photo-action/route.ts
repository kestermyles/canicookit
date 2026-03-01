import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { photoId, action } = await request.json();

    if (!photoId || !['approve', 'delete'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid photoId or action' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    if (action === 'approve') {
      const { error } = await supabase
        .from('recipe_photos')
        .update({ status: 'approved' })
        .eq('id', photoId);

      if (error) throw error;
    } else if (action === 'delete') {
      const { error } = await supabase
        .from('recipe_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin] Photo action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}
