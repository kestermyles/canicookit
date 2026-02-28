import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query for top contributors based on recipe count
    // Only count featured/approved recipes (status = 'featured')
    const { data, error } = await supabase
      .from('generated_recipes')
      .select('user_id, user_name')
      .eq('status', 'featured')
      .not('user_id', 'is', null);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Count recipes per user
    const contributorCounts = new Map<string, { name: string; count: number }>();

    data?.forEach((recipe) => {
      const userId = recipe.user_id as string;
      const existing = contributorCounts.get(userId);

      if (existing) {
        existing.count++;
      } else {
        contributorCounts.set(userId, {
          name: recipe.user_name || 'Anonymous',
          count: 1,
        });
      }
    });

    // Convert to array and sort by count
    const topContributors = Array.from(contributorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 contributors

    return NextResponse.json({
      success: true,
      contributors: topContributors,
    });
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top contributors' },
      { status: 500 }
    );
  }
}
