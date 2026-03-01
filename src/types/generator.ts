import { RecipeFrontmatter } from '@/lib/types';

/**
 * Extended recipe data for AI-generated recipes
 * Tracks which ingredients were provided by user vs pantry essentials
 */
export interface GeneratedRecipeData extends RecipeFrontmatter {
  userIngredients: string[];
  method: string[];
}

/**
 * Request to generate a new recipe
 */
export interface GenerateRecipeRequest {
  userIngredients: string[];
  essentials: string[];
  cookingMethod?: string;
  cuisinePreference?: string;
  mealVibe?: string;
}

/**
 * Response from recipe generation
 */
export interface GenerateRecipeResponse {
  success: boolean;
  recipe?: GeneratedRecipeData;
  error?: string;
}

/**
 * Request to save a generated recipe
 */
export interface SaveRecipeRequest {
  save: true;
  recipe: GeneratedRecipeData;
}

/**
 * Response from saving a recipe
 */
export interface SaveRecipeResponse {
  success: boolean;
  slug?: string;
  error?: string;
}

/**
 * Common pantry essentials assumed to be available
 * These ingredients are displayed as "Your Essentials" and dimmed in recipes
 */
export const PANTRY_ESSENTIALS = [
  'olive oil',
  'salt',
  'pepper',
  'garlic',
  'onion',
  'butter',
  'flour',
  'cornstarch',
  'tinned tomatoes',
  'stock cubes',
  'soy sauce',
  'dried herbs',
  'lemon',
] as const;
