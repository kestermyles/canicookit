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
  'olive oil',
  'vegetable oil',
  'butter',

  // Seasoning
  'salt',
  'black pepper',

  // Aromatics
  'garlic',
  'onion',

  // Acids
  'lemon juice',
  'white wine vinegar',
  'red wine vinegar',

  // Sweeteners
  'sugar',
  'honey',

  // Dry goods
  'plain flour',
  'rice',
  'pasta',

  // Eggs & dairy
  'eggs',
  'milk',

  // Tinned & jarred
  'tinned tomatoes',
  'tomato paste',
  'tinned beans',
  'tinned coconut milk',
  'stock cubes',

  // Condiments & sauces
  'dijon mustard',
  'worcestershire sauce',
  'hot sauce',
  'soy sauce',

  // Spices
  'smoked paprika',
  'cumin',
  'ground coriander',
  'cinnamon',
  'chilli flakes',
  'garlic powder',

  // Dried herbs
  'dried oregano',
  'dried thyme',
  'bay leaves',
  'dried mixed herbs',
] as const;
