-- Can I Cook It - Community Recipe Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Generated community recipes table
CREATE TABLE generated_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  method JSONB NOT NULL,
  user_ingredients JSONB,
  prep_time INTEGER NOT NULL,
  cook_time INTEGER NOT NULL,
  serves INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  budget TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  vegetarian BOOLEAN DEFAULT false,
  vegan BOOLEAN DEFAULT false,
  dairy_free BOOLEAN DEFAULT false,
  gluten_free BOOLEAN DEFAULT false,
  student_kitchen BOOLEAN DEFAULT false,
  cuisine TEXT DEFAULT 'generated',
  tags JSONB DEFAULT '[]',
  photo_url TEXT,
  quality_score DECIMAL(3,1),
  status TEXT NOT NULL DEFAULT 'pending',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_slug TEXT NOT NULL REFERENCES generated_recipes(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  comment TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Recipe photos table
CREATE TABLE recipe_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_slug TEXT NOT NULL REFERENCES generated_recipes(slug) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  quality_score DECIMAL(3,1),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by_name TEXT,
  ip_address INET
);

-- Indexes for performance
CREATE INDEX idx_generated_recipes_status ON generated_recipes(status);
CREATE INDEX idx_generated_recipes_quality_score ON generated_recipes(quality_score DESC);
CREATE INDEX idx_generated_recipes_created_at ON generated_recipes(created_at DESC);
CREATE INDEX idx_comments_recipe_slug ON comments(recipe_slug);
CREATE INDEX idx_recipe_photos_recipe_slug ON recipe_photos(recipe_slug);

-- Enable Row Level Security
ALTER TABLE generated_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_recipes
-- Allow public to read featured recipes
CREATE POLICY "Public can view featured recipes"
  ON generated_recipes FOR SELECT
  USING (status = 'featured');

-- Allow public to view pending recipes (they created them)
CREATE POLICY "Public can view all recipes"
  ON generated_recipes FOR SELECT
  USING (true);

-- Allow public to insert recipes
CREATE POLICY "Public can create recipes"
  ON generated_recipes FOR INSERT
  WITH CHECK (true);

-- Allow public to update recipes (for scoring)
CREATE POLICY "Public can update recipes"
  ON generated_recipes FOR UPDATE
  USING (true);

-- RLS Policies for comments
-- Allow public to read approved comments
CREATE POLICY "Public can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

-- Allow public to create comments
CREATE POLICY "Public can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

-- RLS Policies for recipe_photos
-- Allow public to read all photos
CREATE POLICY "Public can view photos"
  ON recipe_photos FOR SELECT
  USING (true);

-- Allow public to upload photos
CREATE POLICY "Public can upload photos"
  ON recipe_photos FOR INSERT
  WITH CHECK (true);

-- Allow public to update photos (for scoring)
CREATE POLICY "Public can update photos"
  ON recipe_photos FOR UPDATE
  USING (true);
