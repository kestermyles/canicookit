import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a professional food photo using DALL-E 3
 * @param recipeName - The name of the dish/recipe
 * @param description - Brief description of the dish
 * @param cuisine - Optional cuisine type for context
 * @returns URL of the generated image
 */
export async function generateRecipeImage(
  recipeName: string,
  description: string,
  cuisine?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Create detailed prompt for professional food photography of the FINISHED dish
    // Emphasize that it's a plated, cooked meal, not raw ingredients
    const cuisineContext = cuisine && cuisine !== 'generated' ? `, ${cuisine} cuisine` : '';
    const prompt = `A beautifully plated ${recipeName}${cuisineContext}, professionally styled food photography, shot at a 45-degree angle, natural window lighting, on a rustic ceramic plate, garnished and restaurant-quality presentation, shallow depth of field, warm appetising tones, realistic and delicious looking. The dish is fully cooked and ready to eat${description ? `, featuring ${description}` : ''}`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    if (!response.data || response.data.length === 0) {
      return { success: false, error: 'No image data returned from DALL-E' };
    }

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      return { success: false, error: 'No image URL returned from DALL-E' };
    }

    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download an image from URL and upload to Supabase Storage
 * This is needed because DALL-E image URLs are temporary
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  fileName: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { success: false, error: 'Failed to download image' };
    }

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: 'image/png' });

    // Upload to Supabase using the existing uploadPhoto function
    const { uploadPhoto } = await import('./supabase');
    const result = await uploadPhoto(file);

    if (!result.success || !result.url) {
      return { success: false, error: result.error || 'Failed to upload image' };
    }

    return { success: true, publicUrl: result.url };
  } catch (error) {
    console.error('Error downloading and uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
