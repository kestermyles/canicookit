import { RecipeFrontmatter } from '@/lib/types';

/**
 * Extended recipe data for AI-generated recipes
 * Tracks which ingredients were provided by user vs pantry essentials
 */
export interface GeneratedRecipeData extends RecipeFrontmatter {
  userIngredients: string[];
  method: string[];
  flavourBoosters?: string[];
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
  extraPreferences?: string;
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
  // Fats & oils
  'olive oil (or any neutral oil)',
  'vegetable oil (sunflower, rapeseed etc)',
  'butter (salted or unsalted)',

  // Seasoning
  'salt',
  'black pepper',

  // Aromatics
  'garlic (fresh, powder or granules)',
  'onion (or shallots)',

  // Acids
  'lemon juice (fresh or bottled)',
  'white wine vinegar',
  'red wine vinegar',

  // Sweeteners
  'sugar (white or brown)',
  'honey',

  // Dry goods
  'plain flour (all-purpose)',
  'rice (any variety)',
  'pasta (any shape)',

  // Eggs & dairy
  'eggs',
  'milk (any kind)',

  // Tinned & jarred
  'tinned tomatoes (chopped or whole)',
  'tomato paste (also called tomato puree)',
  'tinned coconut milk',
  'stock (cubes, homemade, whatever you have)',

  // Condiments & sauces
  'dijon mustard (or any mustard)',
  'worcestershire sauce',
  'hot sauce (optional, any brand)',
  'soy sauce (or tamari/coconut aminos)',

  // Spices
  'smoked paprika (or regular paprika)',
  'cumin (ground)',
  'garlic powder',
  'dried mixed herbs (oregano, thyme, basil etc)',
] as const;
