import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RECIPE_SLUG = 'spaghetti-alle-vongole-garlic-white-wine-clam-pasta-mm5wdbf4';

async function seedVongolePhotos() {
  console.log('Inserting vongole photos...');

  // Insert photo rows
  const { error: photoError } = await supabase
    .from('recipe_photos')
    .insert([
      {
        recipe_slug: RECIPE_SLUG,
        photo_url: '/images/recipes/vongole-closeup.jpg',
        status: 'approved',
        uploaded_by_name: 'Kester',
      },
      {
        recipe_slug: RECIPE_SLUG,
        photo_url: '/images/recipes/vongole-plated.jpg',
        status: 'approved',
        uploaded_by_name: 'Kester',
      },
    ]);

  if (photoError) {
    console.error('Error inserting photos:', photoError);
  } else {
    console.log('Photos inserted successfully');
  }

  // Update hero image on the recipe
  const { error: updateError } = await supabase
    .from('generated_recipes')
    .update({ photo_url: '/images/recipes/vongole-closeup.jpg' })
    .eq('slug', RECIPE_SLUG);

  if (updateError) {
    console.error('Error updating hero image:', updateError);
  } else {
    console.log('Hero image updated successfully');
  }
}

seedVongolePhotos().then(() => {
  console.log('Done');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
