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

interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  photo_url: string | null;
  cuisine: string;
}

async function generateImage(recipeName: string, description: string, cuisine: string): Promise<string | null> {
  try {
    const cuisineContext = cuisine && cuisine !== 'generated' ? `, ${cuisine} cuisine` : '';
    const prompt = `A beautifully plated ${recipeName}${cuisineContext}, professionally styled food photography, shot at a 45-degree angle, natural window lighting, on a rustic ceramic plate, garnished and restaurant-quality presentation, shallow depth of field, warm appetising tones, realistic and delicious looking. The dish is fully cooked and ready to eat${description ? `, featuring ${description}` : ''}`;

    console.log(`  🎨 Generating image with improved prompt`);

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
      return null;
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      console.error('  ❌ No image URL in response');
      return null;
    }

    console.log(`  ✓ Image generated successfully`);
    return imageUrl;
  } catch (error) {
    console.error('  ❌ Error generating image:', error);
    return null;
  }
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
        upsert: false,
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

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i] as Recipe;
    console.log(`\n[${i + 1}/${recipes.length}] Processing: "${recipe.title}"`);
    console.log(`  Slug: ${recipe.slug}`);

    // Generate image with cuisine context
    const imageUrl = await generateImage(recipe.title, recipe.description, recipe.cuisine);
    if (!imageUrl) {
      console.log('  ⚠️  Skipping - failed to generate image');
      failCount++;
      continue;
    }

    // Download and upload to Supabase Storage
    const fileName = `${recipe.slug}-ai-generated.png`;
    const publicUrl = await downloadAndUpload(imageUrl, fileName);
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
    console.log('  ✅ Complete!');

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
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
