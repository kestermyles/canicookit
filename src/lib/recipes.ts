import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Recipe, RecipeFrontmatter, RecipeSearchItem } from './types';

const recipesDirectory = path.join(process.cwd(), 'recipes');

function normalizeImagePath(img: string): string {
  if (!img) return '';
  if (img.startsWith('/') || img.startsWith('http')) return img;
  return `/images/recipes/${img}`;
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

export function getAllRecipes(): Recipe[] {
  const files = getRecipeFiles();

  return files.map(({ filePath }) => {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as RecipeFrontmatter;
    const contentHtml = marked.parse(content) as string;

    return {
      ...frontmatter,
      heroImage: normalizeImagePath(frontmatter.heroImage),
      images: frontmatter.images?.map(normalizeImagePath),
      content,
      contentHtml,
    };
  });
}

export function getRecipeBySlug(cuisine: string, slug: string): Recipe | null {
  const filePath = path.join(recipesDirectory, cuisine.toLowerCase(), `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const frontmatter = data as RecipeFrontmatter;
  const contentHtml = marked.parse(content) as string;

  return {
    ...frontmatter,
    heroImage: normalizeImagePath(frontmatter.heroImage),
    images: frontmatter.images?.map(normalizeImagePath),
    content,
    contentHtml,
  };
}

export function getRecipesByCuisine(cuisine: string): Recipe[] {
  return getAllRecipes().filter(
    (r) => r.cuisine.toLowerCase() === cuisine.toLowerCase()
  );
}

export function getRecipesByIngredient(ingredient: string): Recipe[] {
  const search = ingredient.toLowerCase();
  return getAllRecipes().filter((r) =>
    r.ingredients.some((ing) => ing.toLowerCase().includes(search))
  );
}

export function getRecipesByFilter(filter: string): Recipe[] {
  const recipes = getAllRecipes();

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
      return [];
  }
}

export function getAllCuisines(): string[] {
  const recipes = getAllRecipes();
  const cuisines = new Set(recipes.map((r) => r.cuisine.toLowerCase()));
  return Array.from(cuisines).sort();
}

export function getPopularIngredients(): string[] {
  const BROWSE_INGREDIENTS = [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'prawns', 'salmon',
    'pasta', 'rice', 'noodles', 'potato', 'bread',
    'tomato', 'onion', 'garlic', 'cheese', 'egg',
    'lentils', 'chickpeas', 'beans', 'tofu', 'mushroom',
    'pepper', 'aubergine', 'courgette', 'spinach', 'broccoli',
  ];

  const recipes = getAllRecipes();
  if (recipes.length === 0) return [];

  return BROWSE_INGREDIENTS.filter((ingredient) => {
    const search = ingredient.toLowerCase();
    return recipes.some((r) =>
      r.ingredients.some((ing) => ing.toLowerCase().includes(search))
    );
  });
}

export function getSearchIndex(): RecipeSearchItem[] {
  return getAllRecipes().map((r) => ({
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
