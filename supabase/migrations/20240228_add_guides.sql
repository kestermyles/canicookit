-- Cooking Guides table
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  read_time TEXT NOT NULL,
  intro TEXT NOT NULL,
  cover_image TEXT,
  steps JSONB NOT NULL,
  pro_tips JSONB NOT NULL,
  related_recipes JSONB DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'curated', -- 'curated' or 'ai-generated'
  status TEXT NOT NULL DEFAULT 'featured', -- 'pending', 'featured', 'rejected'
  quality_score DECIMAL(3,1),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_guides_status ON guides(status);
CREATE INDEX idx_guides_source ON guides(source);
CREATE INDEX idx_guides_quality_score ON guides(quality_score DESC);
CREATE INDEX idx_guides_created_at ON guides(created_at DESC);

-- Full-text search index on title, description, and intro
CREATE INDEX idx_guides_search ON guides USING gin(to_tsvector('english', title || ' ' || description || ' ' || intro));

-- Row Level Security
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Allow public read access to featured guides
CREATE POLICY "Public can view featured guides"
  ON guides
  FOR SELECT
  USING (status = 'featured');

-- Allow authenticated users to insert guides (for AI generation)
CREATE POLICY "Authenticated users can create guides"
  ON guides
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Function to search guides by keyword
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

-- Insert existing curated guides
INSERT INTO guides (slug, title, description, icon, read_time, intro, cover_image, steps, pro_tips, related_recipes, source, status)
VALUES
  (
    'grazing-table',
    'How to Build a Grazing Table',
    'Create an impressive spread that looks professional and feeds a crowd without the stress.',
    '🧀',
    '5 min read',
    'A grazing table is the ultimate crowd-pleaser — it looks stunning, requires minimal cooking, and lets guests help themselves. Whether you''re hosting a party, holiday gathering, or casual get-together, a well-built grazing table will be the centerpiece everyone remembers.',
    '/images/guides/grazing-table.jpg',
    '[{"number":1,"title":"Choose Your Base","content":"Start with a large wooden board, slate, or even butcher paper spread across your table. The bigger, the better — grazing tables are meant to be abundant. If you don''t have a massive board, cluster several smaller boards together for a similar effect."},{"number":2,"title":"Anchor with Bowls and Dips","content":"Place small bowls or ramekins at different points across the table. Fill them with dips (hummus, tzatziki, olive tapenade), spreads (fig jam, honey, mustard), and loose items like nuts or olives. These act as visual anchors and prevent everything from rolling around."},{"number":3,"title":"Add the Cheese","content":"Aim for 3-5 different cheeses with varying textures and flavors: a soft cheese (brie or goat cheese), a hard cheese (aged cheddar or parmesan), a blue cheese, and something mild (mozzarella or havarti). Cut some into slices and leave others whole for guests to cut themselves. Scatter cheese cubes for easy grabbing."},{"number":4,"title":"Layer the Charcuterie","content":"Fold, roll, or ruffle slices of cured meats like prosciutto, salami, chorizo, and pepperoni. Arrange them in waves or fan shapes around the board. Mix colors and textures for visual interest — a pale prosciutto next to a dark salami creates contrast."},{"number":5,"title":"Fill Gaps with Crackers and Bread","content":"Tuck crackers, breadsticks, sliced baguette, and flatbreads into the remaining spaces. Stand some crackers upright in small clusters to add height. Include gluten-free options if needed."},{"number":6,"title":"Add Fresh and Dried Fruit","content":"Grapes, figs, apple slices, berries, and dried apricots add sweetness and color. Fresh fruit should be placed shortly before serving to prevent browning. Dried fruit can go out earlier and won''t wilt."},{"number":7,"title":"Finish with Garnishes","content":"Fresh herbs (rosemary, thyme), edible flowers, and strategically placed nuts fill the final gaps and make the table look lush and intentional. A small dish of flaky sea salt next to the cheese is a nice touch."},{"number":8,"title":"Serve at Room Temperature","content":"Take cheese out of the fridge 30-60 minutes before serving so it softens and the flavors develop. Assemble the table right before guests arrive, but don''t stress about perfection — the beauty is in the abundance."}]'::jsonb,
    '["Budget tip: Skip the fancy cheese board and use parchment or butcher paper directly on the table for easy cleanup.","Use odd numbers when arranging items (3 types of crackers, 5 cheeses) — it looks more natural.","Include something pickled (cornichons, pickled onions) for acidity to balance the rich cheese and meat.","Label cheeses with small cards or chalk labels so guests know what they''re eating.","Make it seasonal: fall = apples and walnuts, summer = berries and basil, winter = dried cranberries and rosemary."]'::jsonb,
    '["italian","mediterranean","french"]'::jsonb,
    'curated',
    'featured'
  ),
  (
    'set-dinner-table',
    'How to Set a Dinner Table',
    'Master the art of table setting — from casual weeknight dinners to formal dinner parties.',
    '🍽️',
    '4 min read',
    'Setting a proper table instantly elevates any meal. You don''t need fancy china or perfect linens — just understanding the basic principles makes any dinner feel more intentional and welcoming.',
    NULL,
    '[{"number":1,"title":"Start with the Tablecloth or Placemats","content":"Lay a tablecloth, runner, or individual placemats as your base. For casual dinners, placemats are fine. For formal meals, use a pressed tablecloth. Make sure it overhangs the table edges by 6-12 inches on all sides."},{"number":2,"title":"Place the Dinner Plate","content":"Center the dinner plate at each seat, about 1-2 inches from the edge of the table. If you''re serving multiple courses, you can stack a salad or appetizer plate on top."},{"number":3,"title":"Add the Forks (Left Side)","content":"Forks go on the left of the plate, arranged in the order they''ll be used from outside to inside. Salad fork on the outside (used first), then dinner fork closest to the plate. Tines should point up."},{"number":4,"title":"Add the Knives and Spoons (Right Side)","content":"Knife goes directly to the right of the plate with the blade facing inward toward the plate. Spoons go to the right of the knife. If serving soup, the soup spoon is on the outside (used first). Dessert spoons can be placed horizontally above the plate."},{"number":5,"title":"Position the Glassware","content":"Place the water glass above the knife tip. If serving wine, the wine glass goes to the right of the water glass. For formal dinners, white wine glass goes in front of red wine glass."},{"number":6,"title":"Fold and Place the Napkin","content":"Napkin can go on the left of the forks, on the plate, or folded in the water glass. For casual dinners, a simple rectangle fold works. For formal dinners, try a classic triangle fold or napkin ring."},{"number":7,"title":"Add Finishing Touches","content":"Place a small side plate for bread above the forks (top left). Add a butter knife horizontally on the bread plate. Salt and pepper shakers should be within reach but not crowding the setting."}]'::jsonb,
    '["Remember the rule: solids on the left (bread plate, forks), liquids on the right (glasses, knife, spoon).","If you don''t have matching silverware, mix and match intentionally — it looks eclectic and charming.","For family dinners, skip the formal setup and just make sure everyone has a fork, knife, glass, and napkin.","Fresh flowers or a simple centerpiece (candles, seasonal fruit) add warmth without blocking conversation.","Dim the lights and use candles for ambiance — even the simplest table setting looks elegant by candlelight."]'::jsonb,
    '["french","italian","british"]'::jsonb,
    'curated',
    'featured'
  ),
  (
    'caramelise-onions',
    'How to Caramelise Onions Properly',
    'Learn the slow, patient method that turns sharp onions into sweet, jammy, golden perfection.',
    '🧅',
    '3 min read',
    'Real caramelised onions take time — 30-40 minutes, not 5. But the deep, sweet, complex flavor they add to burgers, pizzas, pasta, and sandwiches is worth every minute. Once you nail this technique, you''ll find excuses to add them to everything.',
    NULL,
    '[{"number":1,"title":"Slice the Onions Evenly","content":"Use yellow or white onions (they caramelise best). Peel and halve them, then slice into thin half-moons, about ¼ inch thick. Uniform slices cook evenly, so take your time here."},{"number":2,"title":"Use a Wide, Heavy Pan","content":"Choose a large, heavy-bottomed skillet or sauté pan — cast iron or stainless steel works best. The wide surface area allows moisture to evaporate quickly, speeding up caramelisation."},{"number":3,"title":"Start with Butter and Oil","content":"Heat 2 tablespoons of butter and 1 tablespoon of olive oil over medium heat. The butter adds flavor, and the oil prevents it from burning. Once melted and shimmering, add the onions."},{"number":4,"title":"Cook Low and Slow","content":"Add the sliced onions and a pinch of salt. Stir to coat in the fat. Cook over medium to medium-low heat, stirring every 5-10 minutes. The onions will release moisture, soften, and start to turn translucent (10-15 minutes)."},{"number":5,"title":"Let Them Brown (Don''t Rush)","content":"As the onions soften, they''ll begin to brown. Keep stirring occasionally to prevent sticking and burning. Adjust the heat if they''re browning too fast — you want slow, even caramelisation. This stage takes 20-30 minutes."},{"number":6,"title":"Deglaze the Pan","content":"When the onions are golden and sticky, deglaze the pan with a splash of water, wine, or balsamic vinegar. Scrape up the browned bits stuck to the bottom — that''s pure flavor. Let the liquid evaporate and the onions turn jammy."},{"number":7,"title":"Finish and Store","content":"Once the onions are deep golden brown, soft, and sweet, remove from heat. Taste and adjust seasoning with salt or a touch of sugar if needed. Store in an airtight container in the fridge for up to a week, or freeze for up to 3 months."}]'::jsonb,
    '["Don''t crank the heat to speed things up — high heat burns onions, not caramelises them.","A pinch of sugar at the end can boost sweetness, but it''s not necessary if you cook them long enough.","Make a big batch and freeze in portions — they''re perfect for quick weeknight dinners.","Add caramelised onions to: French onion soup, burgers, pizzas, pasta, grilled cheese, quiche, or stir into mashed potatoes.","If the onions start to burn, lower the heat and add a splash of water to loosen them."]'::jsonb,
    '["french","american","italian"]'::jsonb,
    'curated',
    'featured'
  ),
  (
    'perfect-rice',
    'How to Cook Rice Perfectly Every Time',
    'No more mushy, burnt, or undercooked rice. Master the foolproof absorption method.',
    '🍚',
    '4 min read',
    'Perfectly cooked rice is fluffy, separate, and tender — not mushy, sticky, or crunchy. Whether you''re making white rice, brown rice, or basmati, the absorption method is simple and reliable once you learn the ratios and timing.',
    NULL,
    '[{"number":1,"title":"Rinse the Rice","content":"Place rice in a fine-mesh sieve or bowl and rinse under cold water, swirling with your hand, until the water runs clear (usually 2-3 rinses). This removes excess starch and prevents the rice from turning gummy."},{"number":2,"title":"Use the Right Ratio","content":"For white rice (jasmine, basmati, long-grain): 1 cup rice to 1.5 cups water. For brown rice: 1 cup rice to 2 cups water. For short-grain or sushi rice: 1 cup rice to 1.25 cups water. Adjust based on your preference for firmer or softer rice."},{"number":3,"title":"Bring to a Boil","content":"Add the rinsed rice and measured water to a medium saucepan. Add a pinch of salt. Bring to a boil over high heat, uncovered. Don''t stir — just let it boil."},{"number":4,"title":"Reduce Heat and Cover","content":"Once the water boils, reduce the heat to the lowest setting. Cover the pot with a tight-fitting lid. Don''t lift the lid or stir during cooking — trapped steam is what cooks the rice evenly."},{"number":5,"title":"Simmer Until Tender","content":"Cook for 15-18 minutes for white rice, or 40-45 minutes for brown rice. You''ll know it''s done when all the water is absorbed and the rice is tender. If unsure, tilt the pan — if there''s still water, cook for another 2-3 minutes."},{"number":6,"title":"Let It Rest","content":"Remove the pot from heat and let it sit, covered, for 10 minutes. This resting time allows the rice to finish steaming and the grains to firm up. Resist the urge to peek."},{"number":7,"title":"Fluff and Serve","content":"After resting, remove the lid and fluff the rice gently with a fork. Serve immediately, or leave uncovered to cool if making fried rice later."}]'::jsonb,
    '["For extra flavor, cook rice in chicken or vegetable stock instead of water.","Add aromatics: a bay leaf, cardamom pod, or cinnamon stick to the water for fragrant rice.","If your rice is undercooked, add 2-3 tablespoons of water, cover, and steam for another 5 minutes.","If your rice is too wet, spread it on a baking sheet and let it air-dry for 10 minutes.","Leftover rice is perfect for fried rice — day-old rice that''s dried out a bit fries better than fresh."]'::jsonb,
    '["chinese","indian","thai","japanese"]'::jsonb,
    'curated',
    'featured'
  ),
  (
    'store-fresh-herbs',
    'How to Store Fresh Herbs',
    'Keep basil, parsley, cilantro, and other herbs fresh for weeks instead of days.',
    '🌿',
    '3 min read',
    'Fresh herbs wilt fast if stored wrong, but with the right method, you can keep them vibrant and usable for 1-2 weeks. Different herbs need different care — soft herbs like basil and cilantro need moisture, while hardy herbs like rosemary and thyme prefer dryness.',
    NULL,
    '[{"number":1,"title":"Sort by Type","content":"Separate soft herbs (basil, cilantro, parsley, dill, mint) from hardy herbs (rosemary, thyme, sage, oregano). They require different storage methods."},{"number":2,"title":"Trim the Stems","content":"Cut about ½ inch off the bottom of the stems at an angle (like cutting flowers). This helps the herbs absorb water and stay fresh longer."},{"number":3,"title":"Soft Herbs: Treat Like Flowers","content":"Place soft herbs (cilantro, parsley, dill, mint) in a jar or glass with 1-2 inches of water, like a bouquet. Cover loosely with a plastic bag and store in the fridge. Change the water every 2-3 days."},{"number":4,"title":"Basil: Room Temperature, Not Fridge","content":"Basil turns black in the fridge. Store it at room temperature on the counter in a jar of water (like flowers) away from direct sunlight. It will stay fresh for 5-7 days. Change water daily."},{"number":5,"title":"Hardy Herbs: Wrap in Damp Paper Towel","content":"For rosemary, thyme, sage, and oregano, wrap loosely in a slightly damp paper towel, then place in a plastic bag or container. Store in the fridge. They''ll stay fresh for 1-2 weeks."},{"number":6,"title":"Freeze for Long-Term Storage","content":"Chop herbs and freeze in ice cube trays with olive oil or water. Once frozen, transfer cubes to a freezer bag. Perfect for adding to soups, stews, and sauces. Frozen herbs last 3-6 months."}]'::jsonb,
    '["Don''t wash herbs until you''re ready to use them — excess moisture causes rot.","Chives and green onions store best standing upright in a jar of water, like soft herbs.","For a quick herb refresh, soak wilted herbs in ice water for 10 minutes to revive them.","Dried herbs are more potent than fresh — use ⅓ the amount when substituting.","Herb stems have tons of flavor — save them for stocks, sauces, and marinades."]'::jsonb,
    '["italian","thai","mediterranean","vietnamese"]'::jsonb,
    'curated',
    'featured'
  ),
  (
    'dinner-party-budget',
    'How to Host a Dinner Party on a Budget',
    'Throw an impressive dinner party without breaking the bank — smart planning meets generous hospitality.',
    '🎉',
    '6 min read',
    'Hosting a dinner party doesn''t require expensive ingredients or elaborate setups. With thoughtful planning, batch cooking, and a focus on atmosphere over extravagance, you can create a memorable evening that feels special without the steep price tag.',
    NULL,
    '[{"number":1,"title":"Plan a Budget-Friendly Menu","content":"Choose dishes that use affordable, filling ingredients like pasta, rice, beans, chicken thighs, or seasonal vegetables. Avoid expensive cuts of meat or out-of-season produce. A simple pasta dish, roast chicken, or hearty stew can be just as impressive as a complicated recipe."},{"number":2,"title":"Make It a Shared Meal","content":"Ask guests to bring a side dish, dessert, or drinks. This reduces your cost and gives everyone a chance to contribute. Frame it as a potluck-style gathering — people often enjoy participating and it takes pressure off you."},{"number":3,"title":"Cook in Batches and Prep Ahead","content":"Choose recipes that can be made ahead (lasagna, casseroles, braises, salads). This saves time, reduces stress, and lets you enjoy the evening with your guests instead of being stuck in the kitchen. One-pot meals are ideal for easy cleanup."},{"number":4,"title":"Serve Family-Style","content":"Instead of plating individual servings, put dishes in the center of the table and let guests serve themselves. It feels relaxed, encourages conversation, and makes the meal feel abundant even if portions are modest."},{"number":5,"title":"Set the Mood with Ambiance","content":"Lighting and music matter more than fancy decor. Dim the overhead lights, light a few candles, and play background music. A simple tablecloth, napkins, and a vase of fresh flowers (or greenery from your yard) make the table feel special."},{"number":6,"title":"Stretch the Meal with Sides","content":"Fill out the table with inexpensive sides: bread and butter, a simple salad, roasted vegetables, or rice. Guests won''t notice if the main dish is modest when the table feels abundant."},{"number":7,"title":"Skip the Wine Pairing","content":"Instead of buying multiple bottles of wine to pair with each course, offer one good red, one good white, or a signature cocktail. Or make it BYOB and focus your budget on the food."},{"number":8,"title":"Make Dessert Simple","content":"A store-bought dessert with fresh fruit, whipped cream, or ice cream feels homemade with minimal effort. Or bake something simple like brownies or a fruit crumble. Presentation matters more than complexity."}]'::jsonb,
    '["Shop seasonally — in-season produce is cheaper and tastes better.","Check discount bins at the grocery store for bread, cheese, and produce on sale.","Use your freezer — buy meat in bulk when it''s on sale and freeze portions for later.","Cook what you know — don''t experiment with new recipes for a dinner party. Stick to dishes you''ve made before.","A handwritten menu card at each place setting adds a personal touch and costs nothing.","Hospitality is about making people feel welcome, not about spending money. Relax, enjoy, and your guests will too."]'::jsonb,
    '["italian","mexican","french","mediterranean"]'::jsonb,
    'curated',
    'featured'
  );
