import { NextRequest, NextResponse } from 'next/server';
import { uploadPhoto, updateRecipePhoto, getServiceClient } from '@/lib/supabase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const recipeSlug = formData.get('recipeSlug') as string;
    const uploaderName = formData.get('uploaderName') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!recipeSlug) {
      return NextResponse.json(
        { success: false, error: 'Recipe slug is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File must be less than 2MB' },
        { status: 400 }
      );
    }

    console.log('[Upload Photo] Uploading photo for recipe:', recipeSlug);

    // Upload to Supabase Storage
    const uploadResult = await uploadPhoto(file);

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error || 'Upload failed',
        },
        { status: 500 }
      );
    }

    const photoUrl = uploadResult.url;
    console.log('[Upload Photo] Photo uploaded:', photoUrl);

    // Get client IP for tracking
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Insert photo record into database
    const supabase = getServiceClient();
    const { data: photoData, error: photoError } = await supabase
      .from('recipe_photos')
      .insert([
        {
          recipe_slug: recipeSlug,
          photo_url: photoUrl,
          uploaded_by_name: uploaderName || 'Anonymous',
          ip_address: ip,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (photoError) {
      console.error('[Upload Photo] Error creating photo record:', photoError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save photo record',
        },
        { status: 500 }
      );
    }

    // Trigger async photo scoring (don't await)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/score-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photoId: photoData.id,
        photoUrl: photoUrl,
        recipeSlug: recipeSlug,
      }),
    }).catch((err) => {
      console.error('[Upload Photo] Failed to trigger photo scoring:', err);
    });

    return NextResponse.json({
      success: true,
      photoUrl: photoUrl,
      message: 'Photo uploaded successfully. Quality analysis in progress.',
    });
  } catch (error) {
    console.error('[Upload Photo] ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
