import { MetadataRoute } from 'next';
import {
  getAllRecipes,
  getAllCuisines,
  getPopularIngredients,
} from '@/lib/recipes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://canicookit.com';
  const recipes = getAllRecipes();
  const cuisines = getAllCuisines();
  const ingredients = getPopularIngredients();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/basics`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.cuisine.toLowerCase()}/${recipe.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const cuisinePages: MetadataRoute.Sitemap = cuisines.map((cuisine) => ({
    url: `${baseUrl}/recipes/cuisine/${cuisine.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const ingredientPages: MetadataRoute.Sitemap = ingredients.map(
    (ingredient) => ({
      url: `${baseUrl}/recipes/ingredient/${ingredient}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })
  );

  const filterPages: MetadataRoute.Sitemap = [
    'vegetarian',
    'vegan',
    'student-kitchen',
    'dairy-free',
    'gluten-free',
  ].map((filter) => ({
    url: `${baseUrl}/recipes/filter/${filter}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...recipePages,
    ...cuisinePages,
    ...ingredientPages,
    ...filterPages,
  ];
}
