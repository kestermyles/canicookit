import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MIN_QUALITY_SCORE = 7;
const MAX_GENERATION_ATTEMPTS = 3;

/**
 * Score an image using GPT-4 Vision
 * @param imageUrl - URL of the image to score
 * @param recipeName - Name of the dish for context
 * @returns Quality score 0-10
 */
async function scoreImageQuality(
  imageUrl: string,
  recipeName: string
): Promise<{ score: number; reasoning: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Score this food photo of "${recipeName}" out of 10 based on:
1. Presentation (plating, garnish, styling)
2. Lighting (natural, well-lit, appetizing)
3. Correct dish representation (looks like ${recipeName})
4. Appetizing appearance (makes you want to eat it)

Return a JSON object with:
- score (number 0-10)
- reasoning (brief explanation)

Example: {"score": 8.5, "reasoning": "Well-plated with good lighting, looks appetizing but could use more garnish"}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { score: 0, reasoning: 'No response from vision API' };
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { score: 0, reasoning: 'Failed to parse response' };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      score: result.score || 0,
      reasoning: result.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Error scoring image with GPT-4 Vision:', error);
    return { score: 0, reasoning: 'Error during scoring' };
  }
}

/**
 * Generate a professional food photo using DALL-E 3 with quality scoring
 * @param recipeName - The name of the dish/recipe
 * @param description - Brief description of the dish
 * @param cuisine - Optional cuisine type for context
 * @returns URL of the generated image and quality score
 */
export async function generateRecipeImage(
  recipeName: string,
  description: string,
  cuisine?: string
): Promise<{ success: boolean; imageUrl?: string; qualityScore?: number; error?: string }> {
  const cuisineContext = cuisine && cuisine !== 'generated' ? `, ${cuisine} cuisine` : '';
  const prompt = `Close-up of a finished, plated ${recipeName}${cuisineContext}, food photography, clean background, no props, no cameras, no people, just the dish. The food is cooked and ready to eat, professionally styled, natural lighting, shallow depth of field${description ? `, featuring ${description}` : ''}`;

  let bestImage: { url: string; score: number; reasoning: string } | null = null;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      console.log(`[Image Generation] Attempt ${attempt}/${MAX_GENERATION_ATTEMPTS} for "${recipeName}"`);

      // Generate image with DALL-E 3
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      });

      if (!response.data || response.data.length === 0) {
        console.error('[Image Generation] No image data returned');
        continue;
      }

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        console.error('[Image Generation] No image URL returned');
        continue;
      }

      // Score the image with GPT-4 Vision
      console.log(`[Image Generation] Scoring image with GPT-4 Vision...`);
      const { score, reasoning } = await scoreImageQuality(imageUrl, recipeName);
      console.log(`[Image Generation] Score: ${score}/10 - ${reasoning}`);

      // Track best image
      if (!bestImage || score > bestImage.score) {
        bestImage = { url: imageUrl, score, reasoning };
      }

      // If we got a good score, use this image
      if (score >= MIN_QUALITY_SCORE) {
        console.log(`[Image Generation] ✓ Quality threshold met (${score}/10)`);
        return {
          success: true,
          imageUrl: imageUrl,
          qualityScore: score,
        };
      }

      console.log(`[Image Generation] Score ${score}/10 below threshold (${MIN_QUALITY_SCORE}), retrying...`);
    } catch (error) {
      console.error(`[Image Generation] Attempt ${attempt} failed:`, error);
    }
  }

  // All attempts exhausted, return best image we got
  if (bestImage) {
    console.log(`[Image Generation] ⚠️  Using best of ${MAX_GENERATION_ATTEMPTS} attempts (score: ${bestImage.score}/10)`);
    return {
      success: true,
      imageUrl: bestImage.url,
      qualityScore: bestImage.score,
    };
  }

  return {
    success: false,
    error: `Failed to generate acceptable image after ${MAX_GENERATION_ATTEMPTS} attempts`,
  };
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
