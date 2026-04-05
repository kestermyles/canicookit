import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Recipe, RecipeFrontmatter, RecipeSearchItem } from './types';
import {
  supabase,
  getAllCommunityRecipes,
  getRecipeBySlug as getDbRecipeBySlug,
  dbRowToRecipe,
} from './supabase';

const recipesDirectory = path.join(process.cwd(), 'recipes');

function normalizeImagePath(img: string): string {
  if (!img) return '';
  if (img.startsWith('/') || img.startsWith('http')) return img;
  return `/images/recipes/${img}`;
}

/**
 * Resolve relative image paths in rendered HTML to /images/recipes/[slug]/
 * Handles both bare filenames (image.jpg) and already-absolute paths.
 */
function resolveContentImages(html: string, slug: string): string {
  return html.replace(
    /<img\s+src="([^"]+)"/g,
    (_match, src: string) => {
      if (src.startsWith('/') || src.startsWith('http')) return _match;
      return `<img src="/images/recipes/${slug}/${src}"`;
    }
  );
}

function getRecipeFiles(): { cuisine: string; filename: string; filePath: string }[] {
  try {
    if (!fs.existsSync(recipesDirectory)) {
      console.warn(`Recipes directory not found: ${recipesDirectory}`);
      return [];
    }

    const entries: { cuisine: string; filename: string; filePath: string }[] = [];
    const items = fs.readdirSync(recipesDirectory);

    for (const item of items) {
      const itemPath = path.join(recipesDirectory, item);
      const stat = fs.statSync(itemPath);
      if (!stat.isDirectory()) continue;

      const files = fs.readdirSync(itemPath);
      for (const file of files) {
        if (file.endsWith('.md') && !file.startsWith('_')) {
          entries.push({
            cuisine: item,
            filename: file,
            filePath: path.join(itemPath, file),
          });
        }
      }
    }

    return entries;
  } catch (error) {
    console.error('Error reading recipe files:', error);
    return [];
  }
}

/**
 * Get all curated recipes from filesystem
 */
function getCuratedRecipes(): Recipe[] {
  const files = getRecipeFiles();

  return files.map(({ filePath }) => {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as RecipeFrontmatter;
    const rawHtml = marked.parse(content) as string;
    const contentHtml = resolveContentImages(rawHtml, frontmatter.slug);

    return {
      ...frontmatter,
      heroImage: normalizeImagePath(frontmatter.heroImage),
      images: frontmatter.images?.map(normalizeImagePath),
      content,
      contentHtml,
      source: 'curated' as const,
    };
  });
}

/**
 * Get all recipes (curated + community)
 * Includes ALL community recipes regardless of status for search
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    // Get curated recipes
    const curatedRecipes = getCuratedRecipes();

    // Get ALL community recipes (pending, featured, rejected - all statuses)
    const communityRows = await getAllCommunityRecipes();
    const communityRecipes = communityRows.map(dbRowToRecipe);

    // Deduplicate by slug — curated recipes take priority over community stubs
    // (photo uploads for static recipes create stub rows in generated_recipes)
    const curatedSlugs = new Set(curatedRecipes.map((r) => r.slug));
    const uniqueCommunity = communityRecipes.filter(
      (r) => !curatedSlugs.has(r.slug)
    );

    return [...curatedRecipes, ...uniqueCommunity];
  } catch (error) {
    console.error('Error fetching community recipes:', error);
    // Fallback to just curated recipes if Supabase fails
    return getCuratedRecipes();
  }
}

/**
 * Get all recipes synchronously (for backwards compatibility)
 * Only returns curated recipes
 */
export function getAllRecipesSync(): Recipe[] {
  return getCuratedRecipes();
}

/**
 * Get a recipe by cuisine and slug
 * First checks filesystem (curated), then database (community)
 */
export async function getRecipeBySlug(
  cuisine: string,
  slug: string
): Promise<Recipe | null> {
  // First, try to find in curated recipes
  const filePath = path.join(recipesDirectory, cuisine.toLowerCase(), `${slug}.md`);

  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as RecipeFrontmatter;
    const rawHtml = marked.parse(content) as string;
    const contentHtml = resolveContentImages(rawHtml, frontmatter.slug);

    return {
      ...frontmatter,
      heroImage: normalizeImagePath(frontmatter.heroImage),
      images: frontmatter.images?.map(normalizeImagePath),
      content,
      contentHtml,
      source: 'curated' as const,
    };
  }

  // If not found in filesystem, check database (for community recipes)
  try {
    const dbRecipe = await getDbRecipeBySlug(slug);
    if (dbRecipe) {
      return dbRowToRecipe(dbRecipe);
    }
  } catch (error) {
    console.error('Error fetching community recipe:', error);
  }

  return null;
}

export async function getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
  const recipes = await getAllRecipes();
  const lowerCuisine = cuisine.toLowerCase();
  const markdownRecipes = recipes.filter(
    (r) =>
      r.cuisine.toLowerCase() === lowerCuisine ||
      (r.tags && r.tags.some((t) => t.toLowerCase() === lowerCuisine))
  );

  // Also fetch community/generated recipes from Supabase
  let mappedDbRecipes: Recipe[] = [];
  try {
    const { data: dbRecipes } = await supabase
      .from('generated_recipes')
      .select('slug, title, description, tags, prep_time, cook_time, serves, difficulty, calories, photo_url, quality_score, photo_is_ai_generated')
      .contains('tags', [lowerCuisine])
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false });

    mappedDbRecipes = (dbRecipes || []).map((r: any) => ({
      slug: r.slug,
      title: r.title,
      description: r.description,
      cuisine: lowerCuisine,
      heroImage: r.photo_url || '',
      prepTime: r.prep_time,
      cookTime: r.cook_time,
      serves: r.serves,
      difficulty: r.difficulty,
      calories: r.calories,
      source: 'community' as const,
      quality_score: r.quality_score,
      status: 'approved' as const,
      photo_is_ai_generated: r.photo_is_ai_generated,
      tags: r.tags || [],
    })) as Recipe[];
  } catch (error) {
    console.error('Error fetching community recipes by cuisine:', error);
  }

  // Merge and deduplicate by slug
  const allRecipes = [...markdownRecipes, ...mappedDbRecipes];
  const seen = new Set<string>();
  return allRecipes.filter(r => {
    if (seen.has(r.slug)) return false;
    seen.add(r.slug);
    return true;
  });
}

export async function getRecipesByIngredient(
  ingredient: string
): Promise<Recipe[]> {
  const search = ingredient.toLowerCase();
  const recipes = await getAllRecipes();
  return recipes.filter((r) =>
    r.ingredients.some((ing) => ing.toLowerCase().includes(search))
  );
}

const COURSE_TAGS = new Set([
  'breakfast', 'lunch', 'dinner', 'snacks', 'baking', 'starters', 'desserts', 'drinks',
]);

export async function getRecipesByFilter(filter: string): Promise<Recipe[]> {
  const recipes = await getAllRecipes();

  switch (filter) {
    case 'vegetarian':
      return recipes.filter((r) => r.vegetarian);
    case 'vegan':
      return recipes.filter((r) => r.vegan);
    case 'student-kitchen':
      return recipes.filter((r) => r.studentKitchen);
    case 'dairy-free':
      return recipes.filter((r) => r.dairyFree);
    case 'gluten-free':
      return recipes.filter((r) => r.glutenFree);
    default:
      // Course-based filters (breakfast, lunch, dinner, snacks, baking, starters, desserts, drinks)
      if (COURSE_TAGS.has(filter)) {
        return recipes.filter((r) => {
          const tags = (r.tags || []).map((t) => t.toLowerCase());
          // If recipe has a matching tag, include it
          if (tags.includes(filter)) return true;
          // If recipe has no course tags at all, default to dinner
          if (filter === 'dinner') {
            const hasCourseTag = tags.some((t) => COURSE_TAGS.has(t));
            if (!hasCourseTag) return true;
          }
          return false;
        });
      }
      return [];
  }
}

export async function getAllCuisines(): Promise<string[]> {
  const recipes = await getAllRecipes();
  const cuisines = new Set(recipes.map((r) => r.cuisine.toLowerCase()));
  return Array.from(cuisines).sort();
}

export async function getPopularIngredients(): Promise<string[]> {
  const BROWSE_INGREDIENTS = [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'prawns', 'salmon',
    'pasta', 'rice', 'noodles', 'potato', 'bread',
    'tomato', 'onion', 'garlic', 'cheese', 'egg',
    'lentils', 'chickpeas', 'beans', 'tofu', 'mushroom',
    'pepper', 'aubergine', 'courgette', 'spinach', 'broccoli',
  ];

  const recipes = await getAllRecipes();
  if (recipes.length === 0) return [];

  return BROWSE_INGREDIENTS.filter((ingredient) => {
    const search = ingredient.toLowerCase();
    return recipes.some((r) =>
      r.ingredients.some((ing) => ing.toLowerCase().includes(search))
    );
  });
}

export async function getSearchIndex(): Promise<RecipeSearchItem[]> {
  const recipes = await getAllRecipes();
  return recipes.map((r) => ({
    title: r.title,
    slug: r.slug,
    cuisine: r.cuisine,
    description: r.description,
    ingredients: r.ingredients,
    tags: r.tags,
    heroImage: r.heroImage,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    difficulty: r.difficulty,
    calories: r.calories,
    budget: r.budget,
  }));
}

/**
 * Saves a generated recipe to the filesystem
 * @param recipe - The recipe data to save
 * @returns Result object with success status, slug, and optional error
 */
export function saveRecipe(recipe: any): { success: boolean; slug: string; error?: string } {
  try {
    // Generate slug from title
    let slug = recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create generated directory if it doesn't exist
    const generatedDir = path.join(recipesDirectory, 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    // Handle duplicate slugs by appending numbers
    let filePath = path.join(generatedDir, `${slug}.md`);
    let counter = 2;
    while (fs.existsSync(filePath)) {
      slug = `${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${counter}`;
      filePath = path.join(generatedDir, `${slug}.md`);
      counter++;
    }

    // Build YAML frontmatter
    const frontmatter = `---
title: "${recipe.title}"
slug: "${slug}"
cuisine: "generated"
description: "${recipe.description}"
ingredients:
${recipe.ingredients.map((ing: string) => `  - "${ing}"`).join('\n')}
difficulty: "${recipe.difficulty}"
prepTime: ${recipe.prepTime}
cookTime: ${recipe.cookTime}
serves: ${recipe.serves}
budget: "${recipe.budget}"
studentKitchen: ${recipe.studentKitchen}
vegetarian: ${recipe.vegetarian}
vegan: ${recipe.vegan}
dairyFree: ${recipe.dairyFree}
glutenFree: ${recipe.glutenFree}
calories: ${recipe.calories}
protein: ${recipe.protein}
carbs: ${recipe.carbs}
fat: ${recipe.fat}
heroImage: ""
images: []
videoUrl: ""
tags:
${recipe.tags.map((tag: string) => `  - "${tag}"`).join('\n')}
---

## Method

${recipe.method.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n\n')}
`;

    // Write the file
    fs.writeFileSync(filePath, frontmatter, 'utf8');

    return {
      success: true,
      slug,
    };
  } catch (error) {
    console.error('Error saving recipe:', error);
    return {
      success: false,
      slug: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
