-- Add user account support to recipes and comments
-- Run this in Supabase SQL Editor

-- Add user_id columns to existing tables
ALTER TABLE generated_recipes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_name TEXT;

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_recipes_user_id ON generated_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Update RLS policies to allow authenticated users to create their own content
-- For generated_recipes: authenticated users can insert
DROP POLICY IF EXISTS "Public can create recipes" ON generated_recipes;
CREATE POLICY "Authenticated users can create recipes"
  ON generated_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- For comments: authenticated users can insert (already has public insert policy from before)
-- Keep both policies so unauthenticated can still comment
CREATE POLICY IF NOT EXISTS "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
