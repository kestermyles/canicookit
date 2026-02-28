-- Add flagged column to generated_recipes table for admin moderation
ALTER TABLE generated_recipes
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;

-- Create index for faster queries on flagged recipes
CREATE INDEX IF NOT EXISTS idx_generated_recipes_flagged
ON generated_recipes(flagged) WHERE flagged = true;

-- Add comment
COMMENT ON COLUMN generated_recipes.flagged IS 'Indicates if recipe has been flagged for admin review';
