import { NextRequest, NextResponse } from 'next/server';
import { createComment, getComments, getServiceClient } from '@/lib/supabase';

// Simple rate limiting cache (in-memory, resets on server restart)
const rateLimitCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_COMMENTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitCache.get(ip) || [];

  // Remove timestamps outside the window
  const recentTimestamps = timestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW
  );

  if (recentTimestamps.length >= MAX_COMMENTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  // Add current timestamp
  recentTimestamps.push(now);
  rateLimitCache.set(ip, recentTimestamps);

  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeSlug = searchParams.get('recipeSlug');

    if (!recipeSlug) {
      return NextResponse.json(
        { success: false, error: 'Recipe slug is required' },
        { status: 400 }
      );
    }

    const comments = await getComments(recipeSlug);

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('[Comments GET] ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load comments',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeSlug, name, comment } = body;

    // Validate inputs
    if (!recipeSlug || !name || !comment) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: 'Name must be 2-50 characters' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 3 || comment.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'Comment must be 3-500 characters' },
        { status: 400 }
      );
    }

    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Spam/profanity detection
    const lowerComment = comment.toLowerCase();
    const lowerName = name.toLowerCase();
    const profanityKeywords = [
      'viagra',
      'casino',
      'click here',
      'buy now',
      'free money',
      'fuck',
      'shit',
      'cunt',
      'nigger',
      'faggot',
    ];

    const isFlagged = profanityKeywords.some(
      (keyword) => lowerComment.includes(keyword) || lowerName.includes(keyword)
    );

    if (isFlagged) {
      console.warn('[Comments POST] Flagged for review:', comment);
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Ensure recipe row exists in generated_recipes to satisfy FK constraint
    // (static/curated recipes aren't in this table by default)
    const supabase = getServiceClient();
    const { error: upsertError } = await supabase.from('generated_recipes').upsert(
      {
        slug: recipeSlug,
        title: recipeSlug,
        description: 'Static recipe',
        ingredients: [],
        method: [],
        prep_time: 0,
        cook_time: 0,
        serves: 0,
        difficulty: 'easy',
        budget: 'budget',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        status: 'featured',
      },
      { onConflict: 'slug', ignoreDuplicates: true }
    );

    if (upsertError) {
      console.error('[Comments POST] FK upsert failed for slug:', recipeSlug, upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to prepare recipe record' },
        { status: 500 }
      );
    }

    // Create comment — approved by default, pending only if flagged
    const result = await createComment({
      recipe_slug: recipeSlug,
      name: name.trim(),
      comment: comment.trim(),
      rating: body.rating || null,
      ip_address: ip,
      user_agent: userAgent,
      status: isFlagged ? 'pending' : 'approved',
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to submit comment',
        },
        { status: 500 }
      );
    }

    console.log('[Comments POST] Comment created for recipe:', recipeSlug);

    return NextResponse.json({
      success: true,
      message: isFlagged
        ? 'Comment submitted. It will appear after moderation.'
        : 'Your comment has been posted!',
    });
  } catch (error) {
    console.error('[Comments POST] ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit comment',
      },
      { status: 500 }
    );
  }
}
