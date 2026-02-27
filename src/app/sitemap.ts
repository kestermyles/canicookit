import { MetadataRoute } from 'next';
import { getAllRecipes } from '@/lib/recipes';
import { getAllGuides } from '@/lib/guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://canicookit.com';

  // Get all recipes (curated + community)
  const recipes = await getAllRecipes();
  const recipeUrls = recipes.map((recipe) => {
    const url =
      recipe.source === 'community'
        ? `${baseUrl}/recipes/community/${recipe.slug}`
        : `${baseUrl}/recipes/${recipe.cuisine.toLowerCase()}/${recipe.slug}`;

    return {
      url,
      lastModified: recipe.created_at ? new Date(recipe.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: recipe.source === 'community' ? 0.7 : 0.8,
    };
  });

  // Get all guides
  const guides = getAllGuides();
  const guideUrls = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/generate`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/basics`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  return [...staticPages, ...recipeUrls, ...guideUrls];
}
