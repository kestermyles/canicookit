import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearImages() {
  const slugs = [
    'cheesy-tuna-melt-bake-with-garlic-crumb-mm4d7w85',
    'rustic-tuna-tomato-pasta-with-garlic-mm4lyaej',
    'slow-braised-shin-beef-rag-with-pappardelle-parmesan-basil-mm4qzd3i'
  ];

  console.log('Clearing images from 3 recipes...');

  const { error } = await supabase
    .from('generated_recipes')
    .update({ photo_url: null })
    .in('slug', slugs);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✓ Images cleared successfully');
}

clearImages();
