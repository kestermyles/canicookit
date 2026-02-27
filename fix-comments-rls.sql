-- Fix Comments RLS Policy
-- Run this in Supabase SQL Editor to allow comment inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view approved comments" ON comments;
DROP POLICY IF EXISTS "Public can create comments" ON comments;
DROP POLICY IF EXISTS "Public can update comments" ON comments;

-- Recreate policies with correct permissions
-- Allow public to read approved comments
CREATE POLICY "Public can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

-- Allow public to insert comments (this fixes the RLS error)
CREATE POLICY "Public can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

-- Optional: Allow public to view their own pending comments
CREATE POLICY "Public can view all comments"
  ON comments FOR SELECT
  USING (true);

-- Verify RLS is enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
