-- One-time cleanup: remove duplicate recipes, keeping the best version of each
-- (prioritises recipes with photos, then quality scores, then most recent)
DELETE FROM generated_recipes
WHERE id IN (
  SELECT unnest(ids[2:array_length(ids,1)]) FROM (
    SELECT array_agg(id ORDER BY
      CASE WHEN photo_url IS NOT NULL AND photo_url != '' THEN 0 ELSE 1 END ASC,
      CASE WHEN quality_score IS NOT NULL AND quality_score > 0 THEN 0 ELSE 1 END ASC,
      created_at DESC
    ) as ids
    FROM generated_recipes
    GROUP BY title
    HAVING COUNT(*) > 1
  ) dupes
);
