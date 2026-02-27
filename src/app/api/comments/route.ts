import { NextRequest, NextResponse } from 'next/server';
import { createComment, getComments } from '@/lib/supabase';

// Simple rate limiting cache (in-memory, resets on server restart)
const rateLimitCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_COMMENTS_PER_WINDOW = 3;

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

    // Simple spam detection (very basic)
    const lowerComment = comment.toLowerCase();
    const spamKeywords = [
      'http://',
      'https://',
      'www.',
      'click here',
      'buy now',
      'viagra',
      'casino',
    ];

    if (spamKeywords.some((keyword) => lowerComment.includes(keyword))) {
      console.warn('[Comments POST] Possible spam detected:', comment);
      // Still save but mark as pending (will be moderated)
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create comment
    const result = await createComment({
      recipe_slug: recipeSlug,
      name: name.trim(),
      comment: comment.trim(),
      ip_address: ip,
      user_agent: userAgent,
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
      message: 'Comment submitted successfully. It will appear after moderation.',
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
