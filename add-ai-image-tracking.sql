-- Add AI image tracking to generated_recipes
-- Run this in Supabase SQL Editor

-- Add column to track if the current image is AI-generated
ALTER TABLE generated_recipes
ADD COLUMN IF NOT EXISTS photo_is_ai_generated BOOLEAN DEFAULT false;

-- Create index for querying AI-generated images
CREATE INDEX IF NOT EXISTS idx_generated_recipes_photo_is_ai ON generated_recipes(photo_is_ai_generated);
