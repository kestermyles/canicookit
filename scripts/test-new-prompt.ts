import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearOneImage() {
  const slug = 'cheesy-tuna-melt-bake-with-garlic-crumb-mm4d7w85';

  console.log('Clearing image from 1 recipe to test new prompt...');

  const { error } = await supabase
    .from('generated_recipes')
    .update({ photo_url: null })
    .eq('slug', slug);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✓ Image cleared successfully');
  console.log('\nRun: npm run generate-images');
}

clearOneImage();
