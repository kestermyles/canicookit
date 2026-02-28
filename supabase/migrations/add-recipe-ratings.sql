-- Create recipe_ratings table for storing user ratings
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicate ratings from same user for same recipe
  UNIQUE(recipe_slug, user_id)
);

-- Index for fast lookups
CREATE INDEX idx_recipe_ratings_recipe_slug ON recipe_ratings(recipe_slug);
CREATE INDEX idx_recipe_ratings_created_at ON recipe_ratings(created_at DESC);

-- RLS policies
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Public can view ratings"
  ON recipe_ratings FOR SELECT
  USING (true);

-- Authenticated users can insert their own ratings
CREATE POLICY "Authenticated users can create ratings"
  ON recipe_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON recipe_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
  ON recipe_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to get average rating for a recipe
CREATE OR REPLACE FUNCTION get_recipe_rating(recipe_slug_param TEXT)
RETURNS TABLE(average_rating NUMERIC, rating_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*)::bigint as rating_count
  FROM recipe_ratings
  WHERE recipe_slug = recipe_slug_param;
END;
$$ LANGUAGE plpgsql;
