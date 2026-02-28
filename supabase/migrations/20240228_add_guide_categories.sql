-- Add category column to guides table
ALTER TABLE guides ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Basics';

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_guides_category ON guides(category);

-- Update existing guides with appropriate categories

-- Techniques
UPDATE guides SET category = 'Techniques' WHERE slug IN (
  'caramelise-onions',
  'perfect-rice',
  'season-food-properly',
  'rest-meat-properly',
  'cook-fish-without-ruining',
  'build-flavour-in-sauce',
  'cook-pasta-perfectly',
  'make-good-stock'
);

-- Ingredients
UPDATE guides SET category = 'Ingredients' WHERE slug IN (
  'store-fresh-herbs'
);

-- Hosting
UPDATE guides SET category = 'Hosting' WHERE slug IN (
  'grazing-table',
  'set-dinner-table',
  'dinner-party-budget',
  'cook-for-crowd-without-stress'
);

-- Basics
UPDATE guides SET category = 'Basics' WHERE slug IN (
  'read-recipe-properly',
  'save-dish-gone-wrong'
);

-- Kitchen Skills
UPDATE guides SET category = 'Kitchen Skills' WHERE slug IN (
  'sharpen-and-care-for-knives',
  'meal-prep-for-week',
  'make-pastry-without-fear'
);

-- Update the search function to include category
CREATE OR REPLACE FUNCTION search_guides(search_query TEXT)
RETURNS TABLE(
  id UUID,
  slug TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  read_time TEXT,
  intro TEXT,
  cover_image TEXT,
  steps JSONB,
  pro_tips JSONB,
  related_recipes JSONB,
  source TEXT,
  status TEXT,
  quality_score DECIMAL(3,1),
  view_count INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.*,
    ts_rank(
      to_tsvector('english', g.title || ' ' || g.description || ' ' || g.intro),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM guides g
  WHERE
    g.status = 'featured'
    AND (
      to_tsvector('english', g.title || ' ' || g.description || ' ' || g.intro)
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, g.created_at DESC;
END;
$$ LANGUAGE plpgsql;
