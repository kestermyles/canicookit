import { createClient } from '@supabase/supabase-js';
import { Recipe } from './types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client with service role (for admin operations)
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
}

/**
 * Database types matching our schema
 */
export interface GeneratedRecipeRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  ingredients: string[];
  method: string[];
  user_ingredients: string[] | null;
  prep_time: number;
  cook_time: number;
  serves: number;
  difficulty: string;
  budget: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vegetarian: boolean;
  vegan: boolean;
  dairy_free: boolean;
  gluten_free: boolean;
  student_kitchen: boolean;
  cuisine: string;
  tags: string[];
  photo_url: string | null;
  photo_is_ai_generated: boolean;
  quality_score: number | null;
  status: 'pending' | 'featured' | 'rejected';
  view_count: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  user_name: string | null;
}

export interface CommentRow {
  id: string;
  recipe_slug: string;
  name: string;
  comment: string;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string | null;
  user_email: string | null;
}

export interface RecipePhotoRow {
  id: string;
  recipe_slug: string;
  photo_url: string;
  quality_score: number | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  uploaded_by_name: string | null;
  ip_address: string | null;
}

export interface RecipeRatingRow {
  id: string;
  recipe_slug: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeRating {
  averageRating: number;
  ratingCount: number;
}

/**
 * Create a new generated recipe in the database
 */
export async function createRecipe(recipeData: {
  slug: string;
  title: string;
  description: string;
  ingredients: string[];
  method: string[];
  user_ingredients?: string[];
  prep_time: number;
  cook_time: number;
  serves: number;
  difficulty: string;
  budget: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vegetarian: boolean;
  vegan: boolean;
  dairy_free: boolean;
  gluten_free: boolean;
  student_kitchen: boolean;
  tags: string[];
  user_id?: string;
  user_name?: string;
}): Promise<{ success: boolean; data?: GeneratedRecipeRow; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('generated_recipes')
      .insert([
        {
          slug: recipeData.slug,
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          method: recipeData.method,
          user_ingredients: recipeData.user_ingredients || null,
          prep_time: recipeData.prep_time,
          cook_time: recipeData.cook_time,
          serves: recipeData.serves,
          difficulty: recipeData.difficulty,
          budget: recipeData.budget,
          calories: recipeData.calories,
          protein: recipeData.protein,
          carbs: recipeData.carbs,
          fat: recipeData.fat,
          vegetarian: recipeData.vegetarian,
          vegan: recipeData.vegan,
          dairy_free: recipeData.dairy_free,
          gluten_free: recipeData.gluten_free,
          student_kitchen: recipeData.student_kitchen,
          cuisine: 'generated',
          tags: recipeData.tags,
          status: 'pending',
          quality_score: null,
          user_id: recipeData.user_id || null,
          user_name: recipeData.user_name || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a recipe by slug from the database
 */
export async function getRecipeBySlug(
  slug: string
): Promise<GeneratedRecipeRow | null> {
  try {
    const { data, error } = await supabase
      .from('generated_recipes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching recipe:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getRecipeBySlug:', error);
    return null;
  }
}

/**
 * Get all featured community recipes
 */
export async function getFeaturedRecipes(
  limit: number = 50
): Promise<GeneratedRecipeRow[]> {
  try {
    const { data, error } = await supabase
      .from('generated_recipes')
      .select('*')
      .eq('status', 'featured')
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured recipes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeaturedRecipes:', error);
    return [];
  }
}

/**
 * Get all community recipes (for search indexing)
 */
export async function getAllCommunityRecipes(): Promise<GeneratedRecipeRow[]> {
  try {
    const { data, error } = await supabase
      .from('generated_recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching community recipes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllCommunityRecipes:', error);
    return [];
  }
}

/**
 * Update a recipe's quality score and status
 */
export async function updateRecipeScore(
  recipeId: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const status = score >= 7 ? 'featured' : 'pending';

    const { error } = await supabase
      .from('generated_recipes')
      .update({
        quality_score: score,
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recipeId);

    if (error) {
      console.error('Error updating recipe score:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateRecipeScore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a recipe's photo URL
 */
export async function updateRecipePhoto(
  slug: string,
  photoUrl: string,
  isAiGenerated: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('generated_recipes')
      .update({
        photo_url: photoUrl,
        photo_is_ai_generated: isAiGenerated,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (error) {
      console.error('Error updating recipe photo:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateRecipePhoto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Increment view count for a recipe
 */
export async function incrementViewCount(slug: string): Promise<void> {
  try {
    await supabase.rpc('increment_view_count', { recipe_slug: slug });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Upload a photo to Supabase Storage
 * Uses service role client to bypass RLS
 */
export async function uploadPhoto(
  file: File,
  bucket: string = 'recipe-photos'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Use service role client for storage upload (bypasses RLS)
    const serviceClient = getServiceClient();

    // Sanitize filename: replace spaces with hyphens and remove special characters
    const sanitizedName = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${Date.now()}-${sanitizedName}`;
    const { data, error } = await serviceClient.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading photo:', error);
      return { success: false, error: error.message };
    }

    const {
      data: { publicUrl },
    } = serviceClient.storage.from(bucket).getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error in uploadPhoto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all photos for a recipe
 */
export async function getRecipePhotos(
  recipeSlug: string
): Promise<RecipePhotoRow[]> {
  try {
    const { data, error } = await supabase
      .from('recipe_photos')
      .select('*')
      .eq('recipe_slug', recipeSlug)
      .order('quality_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecipePhotos:', error);
    return [];
  }
}

/**
 * Create a new comment
 */
export async function createComment(commentData: {
  recipe_slug: string;
  name: string;
  comment: string;
  ip_address?: string;
  user_agent?: string;
  user_id?: string;
  user_email?: string;
}): Promise<{ success: boolean; data?: CommentRow; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          recipe_slug: commentData.recipe_slug,
          name: commentData.name,
          comment: commentData.comment,
          ip_address: commentData.ip_address || null,
          user_agent: commentData.user_agent || null,
          user_id: commentData.user_id || null,
          user_email: commentData.user_email || null,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createComment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get approved comments for a recipe
 */
export async function getComments(recipeSlug: string): Promise<CommentRow[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('recipe_slug', recipeSlug)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getComments:', error);
    return [];
  }
}

/**
 * Subscribe user to newsletter
 */
export async function subscribeToNewsletter(data: {
  email: string;
  name?: string;
  user_id?: string;
  source?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: data.email,
          name: data.name || null,
          user_id: data.user_id || null,
          source: data.source || 'signup',
        },
      ]);

    if (error) {
      // Ignore duplicate email errors (user already subscribed)
      if (error.code === '23505') {
        return { success: true };
      }
      console.error('Error subscribing to newsletter:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in subscribeToNewsletter:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert database row to Recipe format
 */
export function dbRowToRecipe(row: GeneratedRecipeRow): Recipe {
  return {
    title: row.title,
    slug: row.slug,
    cuisine: row.cuisine,
    description: row.description,
    ingredients: row.ingredients,
    difficulty: row.difficulty as any,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    serves: row.serves,
    budget: row.budget as any,
    studentKitchen: row.student_kitchen,
    vegetarian: row.vegetarian,
    vegan: row.vegan,
    dairyFree: row.dairy_free,
    glutenFree: row.gluten_free,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    heroImage: row.photo_url || '',
    images: [],
    tags: row.tags,
    content: row.method.map((step, i) => `${i + 1}. ${step}`).join('\n\n'),
    contentHtml: row.method
      .map((step, i) => `<p>${i + 1}. ${step}</p>`)
      .join('\n'),
    source: 'community',
    quality_score: row.quality_score || undefined,
    status: row.status,
    photo_url: row.photo_url || undefined,
    photo_is_ai_generated: row.photo_is_ai_generated,
    view_count: row.view_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_ingredients: row.user_ingredients || undefined,
  };
}

/**
 * Get rating for a recipe
 */
export async function getRecipeRating(
  recipeSlug: string
): Promise<RecipeRating> {
  try {
    const { data, error } = await supabase.rpc('get_recipe_rating', {
      recipe_slug_param: recipeSlug,
    });

    if (error) {
      console.error('Error fetching recipe rating:', error);
      return { averageRating: 0, ratingCount: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, ratingCount: 0 };
    }

    return {
      averageRating: parseFloat(data[0].average_rating) || 0,
      ratingCount: parseInt(data[0].rating_count) || 0,
    };
  } catch (error) {
    console.error('Error in getRecipeRating:', error);
    return { averageRating: 0, ratingCount: 0 };
  }
}

/**
 * Submit or update a rating for a recipe
 */
export async function submitRating(
  recipeSlug: string,
  rating: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      // Store in localStorage for anonymous users
      if (typeof window !== 'undefined') {
        localStorage.setItem(`rating-${recipeSlug}`, rating.toString());
      }
      return { success: true };
    }

    // Upsert rating for authenticated users
    const { error } = await supabase.from('recipe_ratings').upsert(
      {
        recipe_slug: recipeSlug,
        user_id: userId,
        rating: rating,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'recipe_slug,user_id',
      }
    );

    if (error) {
      console.error('Error submitting rating:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in submitRating:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's rating for a recipe
 */
export async function getUserRating(
  recipeSlug: string,
  userId?: string
): Promise<number> {
  try {
    if (!userId) {
      // Check localStorage for anonymous users
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`rating-${recipeSlug}`);
        return stored ? parseInt(stored) : 0;
      }
      return 0;
    }

    const { data, error } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_slug', recipeSlug)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.rating;
  } catch (error) {
    console.error('Error in getUserRating:', error);
    return 0;
  }
}

/**
 * Database types for guides
 */
export interface GuideRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  read_time: string;
  intro: string;
  cover_image: string | null;
  steps: { number: number; title: string; content: string }[];
  pro_tips: string[];
  related_recipes: string[];
  source: 'curated' | 'ai-generated';
  status: 'pending' | 'featured' | 'rejected';
  quality_score: number | null;
  view_count: number;
  category: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all featured guides
 */
export async function getFeaturedGuides(): Promise<GuideRow[]> {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('status', 'featured')
      .order('source', { ascending: true }) // curated first
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured guides:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeaturedGuides:', error);
    return [];
  }
}

/**
 * Get a guide by slug
 */
export async function getGuideBySlug(slug: string): Promise<GuideRow | null> {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'featured')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching guide:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getGuideBySlug:', error);
    return null;
  }
}

/**
 * Search guides by keyword
 */
export async function searchGuides(query: string): Promise<GuideRow[]> {
  try {
    const { data, error } = await supabase.rpc('search_guides', {
      search_query: query,
    });

    if (error) {
      console.error('Error searching guides:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchGuides:', error);
    return [];
  }
}

/**
 * Create a new AI-generated guide
 */
export async function createGuide(guideData: {
  slug: string;
  title: string;
  description: string;
  icon: string;
  read_time: string;
  intro: string;
  steps: { number: number; title: string; content: string }[];
  pro_tips: string[];
  related_recipes: string[];
  source?: 'curated' | 'ai-generated';
  status?: 'pending' | 'featured' | 'rejected';
  category?: string;
}): Promise<{ success: boolean; data?: GuideRow; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('guides')
      .insert([
        {
          slug: guideData.slug,
          title: guideData.title,
          description: guideData.description,
          icon: guideData.icon,
          read_time: guideData.read_time,
          intro: guideData.intro,
          steps: guideData.steps,
          pro_tips: guideData.pro_tips,
          related_recipes: guideData.related_recipes,
          source: guideData.source || 'ai-generated',
          status: guideData.status || 'pending',
          category: guideData.category || 'Basics',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating guide:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createGuide:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a guide's quality score and status
 */
export async function updateGuideScore(
  guideId: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const status = score >= 7 ? 'featured' : 'pending';

    const { error } = await supabase
      .from('guides')
      .update({
        quality_score: score,
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guideId);

    if (error) {
      console.error('Error updating guide score:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateGuideScore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
