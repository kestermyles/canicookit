/**
 * One-time migration script to generate AI images for recipes without images
 *
 * Run with: npx tsx scripts/generate-missing-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('❌ Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const MIN_QUALITY_SCORE = 7;
const MAX_GENERATION_ATTEMPTS = 3;

interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  photo_url: string | null;
  cuisine: string;
}

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
    console.error('  ❌ Error scoring image:', error);
    return { score: 0, reasoning: 'Error during scoring' };
  }
}

async function generateImage(recipeName: string, description: string, cuisine: string): Promise<{ imageUrl: string; score: number } | null> {
  const cuisineContext = cuisine && cuisine !== 'generated' ? `, ${cuisine} cuisine` : '';
  const prompt = `Close-up of a finished, plated ${recipeName}${cuisineContext}, food photography, clean background, no props, no cameras, no people, just the dish. The food is cooked and ready to eat, professionally styled, natural lighting, shallow depth of field${description ? `, featuring ${description}` : ''}`;

  let bestImage: { url: string; score: number; reasoning: string } | null = null;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      console.log(`  🎨 Generating image (attempt ${attempt}/${MAX_GENERATION_ATTEMPTS})...`);

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      });

      if (!response.data || response.data.length === 0) {
        console.error('  ❌ No image data returned');
        continue;
      }

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        console.error('  ❌ No image URL in response');
        continue;
      }

      // Score the image with GPT-4 Vision
      console.log(`  🔍 Scoring image quality...`);
      const { score, reasoning } = await scoreImageQuality(imageUrl, recipeName);
      console.log(`  📊 Score: ${score}/10 - ${reasoning}`);

      // Track best image
      if (!bestImage || score > bestImage.score) {
        bestImage = { url: imageUrl, score, reasoning };
      }

      // If we got a good score, use this image
      if (score >= MIN_QUALITY_SCORE) {
        console.log(`  ✓ Quality threshold met (${score}/10)`);
        return { imageUrl, score };
      }

      console.log(`  ⚠️  Score ${score}/10 below threshold (${MIN_QUALITY_SCORE}), retrying...`);
    } catch (error) {
      console.error(`  ❌ Attempt ${attempt} failed:`, error);
    }
  }

  // All attempts exhausted, return best image we got
  if (bestImage) {
    console.log(`  ⚠️  Using best of ${MAX_GENERATION_ATTEMPTS} attempts (score: ${bestImage.score}/10)`);
    return { imageUrl: bestImage.url, score: bestImage.score };
  }

  console.error('  ❌ Failed to generate acceptable image');
  return null;
}

async function downloadAndUpload(imageUrl: string, fileName: string): Promise<string | null> {
  try {
    console.log(`  📥 Downloading image...`);

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('  ❌ Failed to download image');
      return null;
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`  ☁️  Uploading to Supabase Storage...`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('recipe-photos')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('  ❌ Upload error:', error.message);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recipe-photos')
      .getPublicUrl(data.path);

    console.log(`  ✓ Uploaded successfully`);
    return publicUrl;
  } catch (error) {
    console.error('  ❌ Error downloading/uploading:', error);
    return null;
  }
}

async function updateRecipe(slug: string, photoUrl: string): Promise<boolean> {
  try {
    console.log(`  💾 Updating recipe in database...`);

    const { error } = await supabase
      .from('generated_recipes')
      .update({
        photo_url: photoUrl,
        photo_is_ai_generated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (error) {
      console.error('  ❌ Database update error:', error.message);
      return false;
    }

    console.log(`  ✓ Recipe updated successfully`);
    return true;
  } catch (error) {
    console.error('  ❌ Error updating recipe:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting AI image generation for recipes without images\n');

  // Fetch all recipes without images
  console.log('📊 Fetching recipes without images...');
  const { data: recipes, error } = await supabase
    .from('generated_recipes')
    .select('id, slug, title, description, photo_url, cuisine')
    .is('photo_url', null);

  if (error) {
    console.error('❌ Error fetching recipes:', error);
    process.exit(1);
  }

  if (!recipes || recipes.length === 0) {
    console.log('✨ No recipes found without images. All done!');
    process.exit(0);
  }

  console.log(`📝 Found ${recipes.length} recipes without images\n`);

  let successCount = 0;
  let failCount = 0;
  const scores: number[] = [];

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i] as Recipe;
    console.log(`\n[${i + 1}/${recipes.length}] Processing: "${recipe.title}"`);
    console.log(`  Slug: ${recipe.slug}`);

    // Generate image with cuisine context and quality scoring
    const imageResult = await generateImage(recipe.title, recipe.description, recipe.cuisine);
    if (!imageResult) {
      console.log('  ⚠️  Skipping - failed to generate image');
      failCount++;
      continue;
    }

    scores.push(imageResult.score);

    // Download and upload to Supabase Storage
    const fileName = `${recipe.slug}-ai-generated.png`;
    const publicUrl = await downloadAndUpload(imageResult.imageUrl, fileName);
    if (!publicUrl) {
      console.log('  ⚠️  Skipping - failed to upload image');
      failCount++;
      continue;
    }

    // Update recipe
    const updated = await updateRecipe(recipe.slug, publicUrl);
    if (!updated) {
      console.log('  ⚠️  Skipping - failed to update database');
      failCount++;
      continue;
    }

    successCount++;
    console.log(`  ✅ Complete! (Final quality score: ${imageResult.score}/10)`);

    // Add a small delay to avoid rate limits
    if (i < recipes.length - 1) {
      console.log('  ⏳ Waiting 2 seconds before next recipe...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total recipes: ${recipes.length}`);

  if (scores.length > 0) {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    console.log('\n📈 Image Quality Scores:');
    console.log(`  Average: ${avgScore.toFixed(1)}/10`);
    console.log(`  Range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`);
  }

  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
