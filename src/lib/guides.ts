// This file has been migrated to Supabase
// All guide data now comes from the database
// See src/lib/supabase.ts for guide-related functions

export interface Guide {
  slug: string;
  title: string;
  description: string;
  icon: string;
  readTime: string;
  intro: string;
  coverImage?: string;
  steps: {
    number: number;
    title: string;
    content: string;
  }[];
  proTips: string[];
  relatedRecipes: string[];
  category?: string;
}

/**
 * Convert Supabase GuideRow to Guide format
 */
export function dbRowToGuide(row: any): Guide {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    icon: row.icon,
    readTime: row.read_time,
    intro: row.intro,
    coverImage: row.cover_image || undefined,
    steps: row.steps,
    proTips: row.pro_tips,
    relatedRecipes: row.related_recipes,
    category: row.category,
  };
}

// Legacy functions - these should not be used anymore
// Use getFeaturedGuides() and getGuideBySlug() from @/lib/supabase instead
export function getGuideBySlug(slug: string): Guide | undefined {
  console.error('DEPRECATED: getGuideBySlug from guides.ts is deprecated. Use getGuideBySlug from @/lib/supabase instead.');
  return undefined;
}

export function getAllGuides(): Guide[] {
  console.error('DEPRECATED: getAllGuides from guides.ts is deprecated. Use getFeaturedGuides from @/lib/supabase instead.');
  return [];
}
