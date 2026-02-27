import { GeneratedRecipeData } from '@/types/generator';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a generated recipe to ensure all required fields are present
 * and values are within acceptable ranges
 */
export function validateGeneratedRecipe(data: any): ValidationResult {
  const errors: string[] = [];

  // Required string fields
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  }
  if (!data.cuisine || typeof data.cuisine !== 'string') {
    errors.push('Cuisine is required');
  }

  // Required array fields
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    errors.push('Ingredients array is required and must not be empty');
  }
  if (!Array.isArray(data.method) || data.method.length === 0) {
    errors.push('Method array is required and must not be empty');
  }
  if (!Array.isArray(data.userIngredients)) {
    errors.push('User ingredients array is required');
  }
  if (!Array.isArray(data.tags)) {
    errors.push('Tags array is required');
  }

  // Difficulty validation
  const validDifficulties = ['easy', 'getting-somewhere', 'weekend-cook'];
  if (!validDifficulties.includes(data.difficulty)) {
    errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  // Budget validation
  const validBudgets = ['cheap', 'reasonable', 'splash-out'];
  if (!validBudgets.includes(data.budget)) {
    errors.push(`Budget must be one of: ${validBudgets.join(', ')}`);
  }

  // Numeric fields with ranges
  if (typeof data.prepTime !== 'number' || data.prepTime < 0 || data.prepTime > 120) {
    errors.push('Prep time must be a number between 0 and 120 minutes');
  }
  if (typeof data.cookTime !== 'number' || data.cookTime < 0 || data.cookTime > 300) {
    errors.push('Cook time must be a number between 0 and 300 minutes');
  }
  if (typeof data.serves !== 'number' || data.serves < 1 || data.serves > 20) {
    errors.push('Serves must be a number between 1 and 20');
  }

  // Nutrition validation
  if (typeof data.calories !== 'number' || data.calories < 0 || data.calories > 5000) {
    errors.push('Calories must be a number between 0 and 5000');
  }
  if (typeof data.protein !== 'number' || data.protein < 0 || data.protein > 500) {
    errors.push('Protein must be a number between 0 and 500g');
  }
  if (typeof data.carbs !== 'number' || data.carbs < 0 || data.carbs > 500) {
    errors.push('Carbs must be a number between 0 and 500g');
  }
  if (typeof data.fat !== 'number' || data.fat < 0 || data.fat > 500) {
    errors.push('Fat must be a number between 0 and 500g');
  }

  // Boolean fields
  const booleanFields = ['vegetarian', 'vegan', 'dairyFree', 'glutenFree', 'studentKitchen'];
  for (const field of booleanFields) {
    if (typeof data[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
