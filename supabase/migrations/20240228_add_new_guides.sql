-- Add 12 new curated cooking guides

INSERT INTO guides (slug, title, description, icon, read_time, intro, steps, pro_tips, related_recipes, source, status)
VALUES
  -- 1. How to Season Food Properly
  (
    'season-food-properly',
    'How to Season Food Properly 🧂',
    'Learn when to salt, how much to use, and why proper seasoning makes all the difference.',
    '🧂',
    '4 min read',
    'Seasoning isn''t about making food taste "salty" — it''s about bringing out the natural flavors already there. Most home cooks under-season their food, and it shows. Once you nail this, every dish you make will taste noticeably better.',
    '[
      {
        "number": 1,
        "title": "Salt in Layers, Not All at Once",
        "content": "Season at multiple stages of cooking. Add salt when you start sautéing onions, season meat before it hits the pan, salt pasta water, and taste and adjust at the end. This builds flavor gradually instead of making food taste one-dimensionally salty."
      },
      {
        "number": 2,
        "title": "Use More Than You Think",
        "content": "Most recipes under-call for salt. Start with the recommended amount, taste, then add more. The food should taste vibrant and flavorful, not flat or bland. If you''re nervous, add salt in small increments and taste between additions."
      },
      {
        "number": 3,
        "title": "Season Meat Generously Before Cooking",
        "content": "Sprinkle salt and pepper on both sides of steaks, chicken, or fish before cooking. Don''t be shy — a lot of it will stay on the pan or grill. For thick cuts, season 30-60 minutes ahead and let it sit at room temperature so the salt penetrates."
      },
      {
        "number": 4,
        "title": "Salt Pasta Water Like the Sea",
        "content": "Your pasta water should taste noticeably salty, almost like seawater. This is your only chance to season the pasta itself. Use about 1-2 tablespoons of salt per gallon of water. Undersalted pasta makes bland pasta dishes, even with great sauce."
      },
      {
        "number": 5,
        "title": "Taste and Adjust at the End",
        "content": "Before serving, always taste and ask: does this need more salt? More acid (lemon, vinegar)? More fat (butter, oil)? A tiny pinch of salt can transform a dish from \"fine\" to \"delicious.\" Trust your palate."
      },
      {
        "number": 6,
        "title": "Use the Right Salt for the Job",
        "content": "Fine sea salt or kosher salt for cooking (easy to pinch and sprinkle). Flaky sea salt (Maldon, fleur de sel) for finishing dishes — it adds texture and a pop of flavor. Table salt works but is more concentrated, so use less."
      }
    ]'::jsonb,
    '[
      "If food tastes flat or boring, it probably needs salt — not more spices.",
      "Add a pinch of salt to sweet dishes (chocolate chip cookies, caramel) to enhance flavor.",
      "Fat carries flavor, acid brightens it, and salt makes you taste both. Use all three.",
      "When in doubt, season in small increments and taste between additions.",
      "Salting meat ahead of time (dry brining) makes it juicier and more flavorful."
    ]'::jsonb,
    '["all"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 2. How to Make a Good Stock from Scratch
  (
    'make-good-stock',
    'How to Make a Good Stock from Scratch 🍲',
    'Turn leftover bones and vegetable scraps into liquid gold that transforms soups, sauces, and braises.',
    '🍲',
    '5 min read',
    'Store-bought stock is fine in a pinch, but homemade stock has a depth of flavor that''s hard to beat. It''s also basically free if you save bones and vegetable scraps. Once you start making your own, you''ll never go back.',
    '[
      {
        "number": 1,
        "title": "Save Bones and Scraps",
        "content": "Keep a bag in your freezer for chicken bones (from roast chicken or raw carcasses), beef bones, or vegetable scraps (onion ends, carrot peels, celery tops, herb stems). When the bag is full, make stock. This costs you nothing and reduces waste."
      },
      {
        "number": 2,
        "title": "Roast Bones for Deeper Flavor (Optional)",
        "content": "For richer, darker stock (especially for beef or chicken), roast the bones at 400°F for 30-40 minutes until browned. This adds a roasted, caramelized flavor that makes the stock more complex."
      },
      {
        "number": 3,
        "title": "Add Aromatics",
        "content": "Place bones in a large pot and cover with cold water. Add aromatics: onion (quartered, skin on for color), carrot, celery, garlic, bay leaves, peppercorns, and fresh herbs (parsley, thyme). Don''t bother peeling vegetables — you''ll strain everything out later."
      },
      {
        "number": 4,
        "title": "Bring to a Bare Simmer",
        "content": "Bring the pot to a boil, then immediately reduce to the lowest simmer. You want tiny bubbles breaking the surface, not a rolling boil. Boiling makes stock cloudy and bitter. Skim off any foam or scum that rises to the top in the first 30 minutes."
      },
      {
        "number": 5,
        "title": "Simmer Low and Slow",
        "content": "Simmer for 2-4 hours for chicken stock, 6-8 hours for beef stock (or overnight in a slow cooker). The longer it simmers, the more flavor and gelatin extract from the bones. Add water if the level drops below the bones."
      },
      {
        "number": 6,
        "title": "Strain and Store",
        "content": "Strain the stock through a fine-mesh sieve or cheesecloth into a clean container. Discard the bones and vegetables. Let it cool, then refrigerate. The fat will solidify on top — skim it off before using (or leave it for extra flavor)."
      },
      {
        "number": 7,
        "title": "Reduce for More Flavor",
        "content": "For a more concentrated stock, simmer the strained stock uncovered until it reduces by half. This intensifies the flavor and is perfect for sauces. You can also freeze stock in ice cube trays for easy portioning."
      }
    ]'::jsonb,
    '[
      "Stock freezes beautifully for up to 6 months. Freeze in 1-2 cup portions in freezer bags or jars.",
      "Good stock should gel when cold — that''s the gelatin from the bones, which adds richness.",
      "Don''t salt your stock while cooking. Salt it when you use it in a recipe, so you control the seasoning.",
      "For vegetable stock, simmer for 45 minutes max — longer makes it bitter.",
      "Save Parmesan rinds in the freezer and add them to stock for umami depth."
    ]'::jsonb,
    '["french", "italian", "chinese"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 3. How to Cook Pasta Perfectly
  (
    'cook-pasta-perfectly',
    'How to Cook Pasta Perfectly 🍝',
    'Al dente pasta that actually tastes good and holds sauce properly — the foolproof method.',
    '🍝',
    '3 min read',
    'Most people overcook pasta and undersalt the water. Learn the two simple rules for perfect pasta every time: salty water and proper timing. Once you nail this, pasta dishes will taste restaurant-quality at home.',
    '[
      {
        "number": 1,
        "title": "Use Plenty of Water",
        "content": "Use a large pot with at least 4-6 quarts of water per pound of pasta. This prevents the pasta from sticking and ensures even cooking. Don''t overcrowd the pot."
      },
      {
        "number": 2,
        "title": "Salt the Water Generously",
        "content": "Add 1-2 tablespoons of salt per gallon of water once it''s boiling. The water should taste like the sea — salty, but not undrinkable. This is your only chance to season the pasta itself. Undersalted pasta makes every dish taste flat."
      },
      {
        "number": 3,
        "title": "Don''t Add Oil to the Water",
        "content": "Adding oil to pasta water doesn''t prevent sticking (stirring does). Worse, it coats the pasta and prevents sauce from clinging. Skip the oil and stir occasionally instead."
      },
      {
        "number": 4,
        "title": "Cook to Al Dente",
        "content": "Check the package for cooking time, then start tasting 1-2 minutes before. Al dente means the pasta is cooked through but still has a slight bite in the center — not mushy, not crunchy. It should be tender but hold its shape."
      },
      {
        "number": 5,
        "title": "Reserve Pasta Water",
        "content": "Before draining, scoop out 1-2 cups of the starchy pasta water. This liquid is gold for finishing sauces — it helps the sauce cling to the pasta and adds silkiness without cream."
      },
      {
        "number": 6,
        "title": "Finish Pasta in the Sauce",
        "content": "Don''t just dump sauce on drained pasta. Instead, drain pasta 1 minute early, add it to the sauce in the pan, and cook together for 1-2 minutes, adding pasta water as needed. This binds the sauce to the pasta."
      }
    ]'::jsonb,
    '[
      "For fresh pasta, reduce cooking time to 2-4 minutes — it cooks much faster than dried.",
      "If making pasta salad or baked pasta, slightly undercook (1-2 minutes less) since it''ll keep cooking.",
      "Rinse pasta only if making cold pasta salad. Otherwise, the starch helps sauce cling.",
      "Different pasta shapes pair with different sauces: long noodles for light sauces, short shapes for chunky sauces.",
      "Save leftover pasta water in a jar and use it to thin out sauces or soups the next day."
    ]'::jsonb,
    '["italian"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 4. How to Rest Meat and Why It Matters
  (
    'rest-meat-properly',
    'How to Rest Meat and Why It Matters 🥩',
    'Stop cutting into meat immediately. Let it rest and keep all those delicious juices inside.',
    '🥩',
    '3 min read',
    'Cutting into a steak or roast chicken straight off the heat is a rookie mistake. All the juices run out onto the plate and the meat ends up dry. Resting meat is one of the easiest ways to make it dramatically better.',
    '[
      {
        "number": 1,
        "title": "Why Resting Matters",
        "content": "When meat cooks, the muscle fibers contract and push juices toward the center. If you cut into it immediately, those juices spill out onto the cutting board. Resting allows the fibers to relax and reabsorb the juices, making the meat tender and juicy."
      },
      {
        "number": 2,
        "title": "How Long to Rest",
        "content": "Small cuts (steaks, chicken breasts, pork chops): 5-10 minutes. Medium cuts (whole chicken, small roasts): 10-15 minutes. Large cuts (prime rib, turkey, leg of lamb): 20-30 minutes. The bigger the cut, the longer the rest."
      },
      {
        "number": 3,
        "title": "Tent Loosely with Foil",
        "content": "Transfer the meat to a cutting board or plate and tent loosely with aluminum foil. Don''t wrap tightly — this traps steam and makes the crust soggy. Just lay the foil over the top to keep it warm."
      },
      {
        "number": 4,
        "title": "Don''t Worry About It Getting Cold",
        "content": "Meat retains heat well, especially large roasts. A 10-minute rest won''t make your steak cold — it''ll still be hot when you slice it. If anything, resting brings the meat to the perfect eating temperature."
      },
      {
        "number": 5,
        "title": "Use Resting Time to Make Pan Sauce",
        "content": "While the meat rests, use the pan drippings to make a quick sauce. Deglaze with wine or stock, scrape up the browned bits, add butter, and reduce. The timing works out perfectly."
      }
    ]'::jsonb,
    '[
      "For steaks, rest on a wire rack over a plate so the bottom doesn''t get soggy from trapped steam.",
      "Carryover cooking: meat continues cooking while resting, rising 5-10°F. Pull it off heat a few degrees early.",
      "If you''re in a rush, even a 5-minute rest is better than none.",
      "Don''t rest ground meat (burgers, meatballs) — they don''t need it and will get cold.",
      "Save the resting juices on the cutting board and pour them over the sliced meat or into your sauce."
    ]'::jsonb,
    '["american", "french", "british"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 5. How to Make Pastry Without Fear
  (
    'make-pastry-without-fear',
    'How to Make Pastry Without Fear 🥐',
    'Flaky, buttery pastry isn''t magic. It''s just cold fat, minimal handling, and confidence.',
    '🥐',
    '6 min read',
    'Pastry intimidates people, but it shouldn''t. The science is simple: keep everything cold, don''t overwork the dough, and handle it with confidence. Once you understand the basics, you can make pie crusts, tarts, and puff pastry at home.',
    '[
      {
        "number": 1,
        "title": "Keep Everything Cold",
        "content": "Cold butter creates steam pockets as it melts in the oven, which makes pastry flaky. Keep butter in the fridge until you need it. Use ice water. If your kitchen is hot, chill the flour and bowl in the freezer for 15 minutes before starting."
      },
      {
        "number": 2,
        "title": "Cut Butter into Flour",
        "content": "Cube cold butter and toss it into the flour. Use a pastry cutter, two knives, or your fingers to work the butter into the flour until it looks like coarse breadcrumbs with pea-sized chunks of butter. Those butter chunks = flakiness."
      },
      {
        "number": 3,
        "title": "Add Water Gradually",
        "content": "Drizzle in ice-cold water, 1 tablespoon at a time, mixing gently with a fork. Stop as soon as the dough starts to come together. It should look shaggy, not wet or sticky. Too much water makes tough pastry."
      },
      {
        "number": 4,
        "title": "Don''t Overwork the Dough",
        "content": "Once the dough holds together, stop mixing. Overworking develops gluten, which makes pastry tough instead of flaky. Gather the dough into a ball, flatten into a disk, wrap in plastic, and chill for at least 30 minutes (or up to 3 days)."
      },
      {
        "number": 5,
        "title": "Roll Out on a Floured Surface",
        "content": "Lightly flour your work surface and rolling pin. Roll from the center outward, rotating the dough 90° after each roll to keep it round. If it cracks, the dough is too cold — let it sit for 5 minutes. If it sticks, add more flour."
      },
      {
        "number": 6,
        "title": "Transfer Carefully",
        "content": "Roll the dough loosely around the rolling pin, then unroll it over your pie dish or tart pan. Press gently into the pan, trim excess dough, and crimp the edges. Chill again for 15 minutes before baking."
      },
      {
        "number": 7,
        "title": "Blind Bake for Crisp Crusts",
        "content": "For pies with wet fillings, blind bake the crust first. Line with parchment and fill with pie weights (or dried beans). Bake at 375°F for 15 minutes, remove weights, and bake another 10 minutes until golden."
      }
    ]'::jsonb,
    '[
      "Make pastry in advance and freeze it. It keeps for 3 months and thaws quickly.",
      "If the dough tears, patch it with scraps and press to seal — it''ll bake together seamlessly.",
      "Use a food processor to make pastry in 30 seconds — pulse butter into flour, add water, pulse until combined.",
      "Egg wash (beaten egg brushed on top) gives pastry a shiny, golden finish.",
      "Sweet pastry uses powdered sugar instead of granulated for a finer texture."
    ]'::jsonb,
    '["french", "british", "american"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 6. How to Cook Fish Without Ruining It
  (
    'cook-fish-without-ruining',
    'How to Cook Fish Without Ruining It 🐟',
    'Stop overcooking fish. Learn the signs of perfectly cooked fish and how to avoid dry, rubbery disasters.',
    '🐟',
    '4 min read',
    'Fish cooks fast and overcooks even faster. Most people cook fish until it''s dry and rubbery because they don''t know what to look for. Once you learn the visual and tactile cues, you''ll cook restaurant-quality fish every time.',
    '[
      {
        "number": 1,
        "title": "Pat Fish Dry Before Cooking",
        "content": "Moisture is the enemy of a good sear. Pat fish fillets completely dry with paper towels before seasoning. Dry fish = crispy skin and a golden crust. Wet fish = steaming and sticking."
      },
      {
        "number": 2,
        "title": "Season Simply",
        "content": "Salt, pepper, and a squeeze of lemon are all fish needs. Don''t mask the flavor with heavy spices unless you''re making a specific dish. Season both sides, including the skin if it''s on."
      },
      {
        "number": 3,
        "title": "Use High Heat and a Hot Pan",
        "content": "Heat a heavy skillet (cast iron or stainless steel) over medium-high heat until it''s hot. Add oil and let it shimmer. This high heat creates a crust and prevents sticking. Lower heat = fish falling apart."
      },
      {
        "number": 4,
        "title": "Skin Side Down First",
        "content": "If cooking skin-on fish, place it skin-side down in the hot pan and press gently with a spatula for 10 seconds to prevent curling. Let it cook undisturbed for 3-5 minutes until the skin is crispy and golden."
      },
      {
        "number": 5,
        "title": "Flip Once, Cook Briefly",
        "content": "When the fish is 70-80% cooked through (the flesh looks opaque up the sides), flip it carefully. Cook for another 1-2 minutes on the flesh side. The residual heat will finish cooking it through — don''t overdo it."
      },
      {
        "number": 6,
        "title": "Check for Doneness",
        "content": "Fish is done when it flakes easily with a fork and the center is just opaque (or slightly translucent for tuna/salmon). It should feel firm but still give slightly when pressed. Overcooked fish is dry and chalky."
      }
    ]'::jsonb,
    '[
      "For even thickness, tuck the thin tail end under itself before cooking.",
      "Remove fish from the fridge 10 minutes before cooking so it cooks evenly.",
      "Use a fish spatula (thin, flexible metal spatula) for easy flipping without breaking.",
      "For perfectly crispy skin, don''t move or flip the fish until it releases naturally from the pan.",
      "Finishing in a 400°F oven works great for thick fillets — sear skin side, then bake for 5-8 minutes."
    ]'::jsonb,
    '["mediterranean", "asian", "french"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 7. How to Build Flavour in a Sauce
  (
    'build-flavour-in-sauce',
    'How to Build Flavour in a Sauce 🫕',
    'Layer flavors, deglaze properly, and balance fat, acid, and salt for sauces that actually taste good.',
    '🫕',
    '5 min read',
    'Great sauces aren''t complicated — they''re built in layers. Start with fond (browned bits), add aromatics, deglaze with liquid, and finish with fat and acid. This method works for pan sauces, pasta sauces, and braises.',
    '[
      {
        "number": 1,
        "title": "Start with Fond",
        "content": "Fond is the browned, caramelized bits stuck to the bottom of the pan after searing meat or sautéing vegetables. It''s pure concentrated flavor. Don''t wash it away — that''s the base of your sauce."
      },
      {
        "number": 2,
        "title": "Sauté Aromatics",
        "content": "Lower the heat and add aromatics (onions, shallots, garlic, ginger). Cook until soft and fragrant, scraping up some of the fond. Aromatics build a flavor foundation that makes everything else taste better."
      },
      {
        "number": 3,
        "title": "Deglaze the Pan",
        "content": "Add liquid (wine, stock, vinegar, or even water) to the hot pan and use a wooden spoon to scrape up all the browned bits. This is deglazing, and it''s where the magic happens. Let the liquid reduce by half to concentrate flavors."
      },
      {
        "number": 4,
        "title": "Add Stock or Cream",
        "content": "Add stock, broth, or cream and let it simmer until it reduces and thickens. Reducing concentrates flavor and gives the sauce body. Taste as you go — if it tastes weak, keep reducing."
      },
      {
        "number": 5,
        "title": "Finish with Fat",
        "content": "Off the heat, stir in cold butter, cream, or olive oil. This adds richness, gives the sauce a glossy finish, and smooths out sharp flavors. A tablespoon of butter transforms a good sauce into a great one."
      },
      {
        "number": 6,
        "title": "Balance with Acid and Salt",
        "content": "Taste the sauce. Does it need brightness? Add lemon juice, vinegar, or wine. Does it taste flat? Add salt. Does it need richness? Add more butter. Balancing fat, acid, and salt is the key to making sauces taste professional."
      }
    ]'::jsonb,
    '[
      "For a thicker sauce, whisk in a cornstarch slurry (1 tsp cornstarch + 1 tbsp cold water).",
      "For silky smooth sauces, strain through a fine-mesh sieve before serving.",
      "Reduce cream sauces over low heat to avoid curdling.",
      "Fresh herbs added at the end brighten sauces without cooking off their flavor.",
      "Save and freeze pan drippings from roast chicken or beef — they make incredible sauces."
    ]'::jsonb,
    '["french", "italian", "american"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 8. How to Sharpen and Care for Your Knives
  (
    'sharpen-and-care-for-knives',
    'How to Sharpen and Care for Your Knives 🔪',
    'A sharp knife is safer, faster, and makes cooking more enjoyable. Here''s how to keep your knives in shape.',
    '🔪',
    '5 min read',
    'Dull knives are dangerous — they slip and require more force, increasing the risk of cuts. A sharp knife cuts cleanly and makes prep work faster. Learning to maintain your knives is one of the best investments you can make as a cook.',
    '[
      {
        "number": 1,
        "title": "Understand the Difference: Honing vs. Sharpening",
        "content": "Honing (with a honing steel) realigns the blade edge and should be done regularly — even daily. Sharpening (with a whetstone or sharpener) removes metal to create a new edge and is needed every few months to a year, depending on use."
      },
      {
        "number": 2,
        "title": "Hone Your Knife Regularly",
        "content": "Hold the honing steel vertically and swipe the knife down at a 15-20° angle, alternating sides, 5-10 times per side. This keeps the edge aligned between sharpenings. Do this before each use if you cook often."
      },
      {
        "number": 3,
        "title": "Sharpen with a Whetstone",
        "content": "Soak the whetstone in water for 10 minutes. Hold the knife at a 15-20° angle and push the blade across the stone in a sweeping motion, starting at the heel and ending at the tip. Repeat 10-15 times per side, alternating."
      },
      {
        "number": 4,
        "title": "Test Sharpness with the Paper Test",
        "content": "Hold a piece of paper vertically and try to slice through it with your knife. A sharp knife will cut cleanly without tearing. If it tears or bends the paper, it needs more sharpening."
      },
      {
        "number": 5,
        "title": "Wash by Hand, Dry Immediately",
        "content": "Never put knives in the dishwasher — it dulls the blade and damages the handle. Wash by hand with soap and water, dry immediately, and store safely. Water left on the blade causes rust and pitting."
      },
      {
        "number": 6,
        "title": "Store Knives Properly",
        "content": "Use a knife block, magnetic strip, or blade guards. Tossing knives in a drawer dulls and chips the blade (and is dangerous). Proper storage protects the edge and keeps your knives sharp longer."
      },
      {
        "number": 7,
        "title": "Use a Cutting Board, Not Plates or Counters",
        "content": "Cut on wood or plastic cutting boards, never on glass, ceramic, or stone. Hard surfaces dull knives instantly. Replace cutting boards when they get deep grooves (bacteria hide there)."
      }
    ]'::jsonb,
    '[
      "If you''re intimidated by whetstones, use a pull-through sharpener or take your knives to a professional once a year.",
      "Carbon steel knives hold a sharper edge but require more care. Stainless steel is lower maintenance.",
      "A sharp paring knife, chef''s knife, and serrated bread knife cover 90% of kitchen tasks.",
      "If your knife won''t hold an edge, it might need professional sharpening or replacement.",
      "Oil the blade of carbon steel knives after washing to prevent rust."
    ]'::jsonb,
    '["all"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 9. How to Meal Prep for the Week
  (
    'meal-prep-for-week',
    'How to Meal Prep for the Week 📦',
    'Spend 2 hours on Sunday and have ready-to-eat meals all week. Save time, money, and stress.',
    '📦',
    '6 min read',
    'Meal prep isn''t about eating boring chicken and rice every day. It''s about cooking smarter so weeknights are easier. Batch-cook proteins, grains, and veggies, then mix and match throughout the week for variety.',
    '[
      {
        "number": 1,
        "title": "Plan Your Meals First",
        "content": "Decide what you want to eat for the week. Choose 2-3 proteins, 2-3 carbs, and 3-4 vegetables. Write a shopping list based on these ingredients. Planning prevents overbuying and food waste."
      },
      {
        "number": 2,
        "title": "Shop Once, Prep Once",
        "content": "Do one big grocery trip for the week. Then block out 2-3 hours (Sunday works for most people) to batch-cook everything. Multitask: roast vegetables while cooking grains, boil eggs while marinating chicken."
      },
      {
        "number": 3,
        "title": "Cook Proteins in Bulk",
        "content": "Roast or grill 2-3 proteins (chicken breasts, ground beef, salmon, tofu). Season simply so you can flavor them differently throughout the week. Store in airtight containers in the fridge for up to 4 days."
      },
      {
        "number": 4,
        "title": "Batch-Cook Grains and Starches",
        "content": "Cook big batches of rice, quinoa, pasta, or roast potatoes. These reheat well and form the base of most meals. Store separately and combine with proteins and vegetables when ready to eat."
      },
      {
        "number": 5,
        "title": "Prep Vegetables",
        "content": "Wash, chop, and roast or steam vegetables (broccoli, carrots, bell peppers, zucchini). Store in containers and reheat when needed. Keep some vegetables raw (lettuce, cucumber, tomatoes) for salads."
      },
      {
        "number": 6,
        "title": "Portion into Containers",
        "content": "Use glass or BPA-free plastic containers with compartments. Portion out meals for lunch or dinner: protein + grain + vegetable. Label with the day or contents. Stack in the fridge so they''re grab-and-go."
      },
      {
        "number": 7,
        "title": "Keep Sauces and Toppings Separate",
        "content": "Store sauces, dressings, and toppings (cheese, nuts, herbs) separately to prevent sogginess. Add them right before eating. This keeps meals fresh and prevents flavor fatigue."
      },
      {
        "number": 8,
        "title": "Mix and Match Throughout the Week",
        "content": "Don''t eat the same meal every day. Combine prepped components differently: chicken + rice + broccoli Monday, chicken + pasta + peppers Tuesday. This keeps things interesting without extra work."
      }
    ]'::jsonb,
    '[
      "Freeze half your prepped meals if cooking for one — they''ll keep for 3 months.",
      "Invest in quality containers that seal well and are microwave-safe.",
      "Prep breakfast too: overnight oats, egg muffins, or smoothie packs.",
      "Cook double batches of dinner during the week and use leftovers for lunch.",
      "Keep a list of \"quick adds\" (canned beans, rotisserie chicken, pre-washed greens) for busy weeks."
    ]'::jsonb,
    '["all"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 10. How to Cook for a Crowd Without Stress
  (
    'cook-for-crowd-without-stress',
    'How to Cook for a Crowd Without Stress 👨‍🍳',
    'Feed 10+ people without losing your mind. Plan ahead, batch-cook, and enjoy the party.',
    '👨‍🍳',
    '6 min read',
    'Cooking for a crowd is intimidating, but it doesn''t have to be stressful. The secret is choosing recipes that can be made ahead, scale easily, and don''t require last-minute fussing. Plan well, and you''ll actually enjoy hosting.',
    '[
      {
        "number": 1,
        "title": "Choose Make-Ahead Dishes",
        "content": "Pick recipes that can be fully or partially made 1-2 days ahead: lasagna, casseroles, braises, marinated meats, salads (undressed), desserts. Avoid recipes that require precise timing or constant attention."
      },
      {
        "number": 2,
        "title": "Keep the Menu Simple",
        "content": "Don''t try to impress with complicated dishes. Choose 1-2 mains, 2-3 sides, and 1 dessert. Fewer dishes mean less stress and better execution. Guests care more about the company than the menu."
      },
      {
        "number": 3,
        "title": "Scale Recipes Properly",
        "content": "Most recipes scale up easily, but check oven space and cookware size. If your oven holds one lasagna, make two smaller ones instead of doubling the recipe. Account for longer cooking times in crowded ovens."
      },
      {
        "number": 4,
        "title": "Batch-Cook and Freeze",
        "content": "Make dishes like chili, soup, or pasta sauce weeks ahead and freeze. Thaw overnight in the fridge and reheat on the day. This spreads out the workload and ensures you''re not cooking everything at once."
      },
      {
        "number": 5,
        "title": "Prep Ingredients the Day Before",
        "content": "Chop vegetables, marinate meat, set the table, and arrange serving dishes the night before. On the day, all you have to do is cook and assemble. This prevents last-minute panic."
      },
      {
        "number": 6,
        "title": "Use the Slow Cooker or Oven",
        "content": "Set-it-and-forget-it cooking is your friend. Braise meat in a slow cooker, roast vegetables in the oven, and cook rice in a rice cooker. This frees up your stovetop and attention for other tasks."
      },
      {
        "number": 7,
        "title": "Serve Family-Style or Buffet",
        "content": "Skip individual plating. Put everything on platters in the middle of the table or set up a buffet. Guests serve themselves, and you''re not stuck in the kitchen plating 12 portions while food gets cold."
      },
      {
        "number": 8,
        "title": "Delegate and Accept Help",
        "content": "Ask guests to bring sides, drinks, or dessert. People want to contribute, and it takes pressure off you. Assign someone to handle drinks or music so you can focus on the food."
      }
    ]'::jsonb,
    '[
      "Make a detailed timeline: when to start cooking, when to put things in the oven, when to set out food.",
      "Double your estimate for how much food you need — people eat more at gatherings.",
      "Have backup snacks (cheese, crackers, bread) in case cooking takes longer than planned.",
      "Disposable aluminum trays make cleanup easier for big gatherings.",
      "Clear out fridge space ahead of time so you have room to store prepped food and leftovers."
    ]'::jsonb,
    '["italian", "mexican", "american"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 11. How to Read a Recipe Properly
  (
    'read-recipe-properly',
    'How to Read a Recipe Properly 📖',
    'Stop halfway through and realizing you''re missing an ingredient. Read recipes the right way.',
    '📖',
    '4 min read',
    'Most people dive into cooking without reading the full recipe, then panic when they realize they need a stand mixer or 24 hours of marinating time. Reading properly saves time, prevents mistakes, and makes cooking smoother.',
    '[
      {
        "number": 1,
        "title": "Read the Entire Recipe Before You Start",
        "content": "Don''t start cooking until you''ve read every step, including notes and tips. This prevents surprises like \"chill for 2 hours\" buried in step 6 when you planned to serve dinner in 30 minutes."
      },
      {
        "number": 2,
        "title": "Check for Prep Work and Equipment",
        "content": "Scan for terms like \"softened butter,\" \"room temperature eggs,\" or \"chilled dough.\" Note equipment you''ll need (stand mixer, food processor, specific pan sizes). Pull everything out before you start cooking."
      },
      {
        "number": 3,
        "title": "Understand Ingredient Descriptions",
        "content": "\"1 cup chopped onion\" means chop first, then measure. \"1 cup onion, chopped\" means measure first, then chop. Pay attention to wording — it affects how much you use."
      },
      {
        "number": 4,
        "title": "Note Timing and Multitasking Opportunities",
        "content": "While something simmers for 20 minutes, can you prep the next step? Look for downtime where you can chop vegetables, wash dishes, or make a sauce. Good recipes build in multitasking."
      },
      {
        "number": 5,
        "title": "Look for Visual and Tactile Cues",
        "content": "The best recipes use descriptions like \"until golden brown\" or \"when it jiggles slightly\" instead of just \"bake for 20 minutes.\" Ovens and stoves vary — trust your senses more than the timer."
      },
      {
        "number": 6,
        "title": "Check the Yield and Scale if Needed",
        "content": "How many servings does the recipe make? If cooking for more or fewer people, adjust ingredients proportionally. Most recipes scale easily, but check cooking times — larger batches may need more time."
      }
    ]'::jsonb,
    '[
      "Mise en place (everything in its place) means prepping all ingredients before you start cooking. It''s worth the effort.",
      "If a recipe says \"season to taste,\" actually taste and adjust. Don''t just dump in salt and hope.",
      "Save recipes that worked and note what you changed. Build your own trusted recipe collection.",
      "If a recipe has terrible reviews or lots of corrections in the comments, find a different one.",
      "Watch a video of the recipe if you''re unsure about technique — seeing it helps."
    ]'::jsonb,
    '["all"]'::jsonb,
    'curated',
    'featured'
  ),

  -- 12. How to Save a Dish That's Gone Wrong
  (
    'save-dish-gone-wrong',
    'How to Save a Dish That''s Gone Wrong 🆘',
    'Too salty, too bland, too spicy, burnt — how to rescue common cooking disasters.',
    '🆘',
    '5 min read',
    'Everyone makes mistakes in the kitchen. The difference between a good cook and a great cook is knowing how to fix things when they go wrong. Most disasters are salvageable if you know the right tricks.',
    '[
      {
        "number": 1,
        "title": "Too Salty: Dilute or Balance",
        "content": "Add more unsalted liquid (water, stock, cream) to dilute the saltiness. Or balance it with acid (lemon juice, vinegar) or sweetness (sugar, honey). Adding a peeled potato to soups absorbs some salt (remove before serving)."
      },
      {
        "number": 2,
        "title": "Too Spicy: Add Dairy or Sweetness",
        "content": "Dairy (cream, yogurt, sour cream, coconut milk) neutralizes heat. Sweetness (sugar, honey) also helps. Add gradually and taste. Serve with rice, bread, or naan to absorb the spice."
      },
      {
        "number": 3,
        "title": "Too Bland: Add Salt, Acid, or Fat",
        "content": "If food tastes flat, it usually needs salt. If it tastes one-dimensional, add acid (lemon, vinegar, wine). If it tastes harsh, add fat (butter, cream, olive oil). Taste and adjust in small increments."
      },
      {
        "number": 4,
        "title": "Too Acidic: Add Sweetness or Fat",
        "content": "If a sauce or soup is too acidic, balance it with a pinch of sugar or honey. Fat (butter, cream) also mellows acidity. Add slowly and taste — you want balance, not sweetness."
      },
      {
        "number": 5,
        "title": "Burnt on the Bottom: Don''t Scrape It",
        "content": "If you burn the bottom of a pot, stop stirring immediately. Carefully transfer the unburnt food to a clean pot, leaving the burnt layer behind. Don''t scrape — it spreads the burnt flavor."
      },
      {
        "number": 6,
        "title": "Overcooked Vegetables: Repurpose Them",
        "content": "Mushy vegetables can''t be un-cooked, but you can repurpose them: blend into soup, mash into a puree, mix into a frittata, or fold into pasta. Embrace the texture change and call it intentional."
      },
      {
        "number": 7,
        "title": "Sauce Too Thin: Reduce or Thicken",
        "content": "Simmer uncovered to evaporate liquid and thicken the sauce. For a quicker fix, whisk in a cornstarch slurry (1 tsp cornstarch + 1 tbsp water) or a beurre manié (butter + flour paste)."
      },
      {
        "number": 8,
        "title": "Sauce Too Thick: Thin with Liquid",
        "content": "Add small amounts of stock, water, cream, or wine until the sauce reaches the right consistency. Whisk constantly to avoid lumps. Taste and re-season if needed after thinning."
      }
    ]'::jsonb,
    '[
      "Taste constantly as you cook so you catch problems early, when they''re easier to fix.",
      "If you accidentally double the salt, make a second unsalted batch and combine them.",
      "Burnt garlic or onions can''t be saved — start over. They turn bitter and ruin the dish.",
      "If rice or pasta is overcooked and mushy, rinse it under cold water and use it for fried rice or pasta salad.",
      "When in doubt, start over. It''s faster than trying to rescue a truly ruined dish."
    ]'::jsonb,
    '["all"]'::jsonb,
    'curated',
    'featured'
  );
