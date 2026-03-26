const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Blocklist of obviously inappropriate/non-food terms
const BLOCKED_TERMS = [
  // Harmful substances
  'bleach', 'poison', 'cyanide', 'arsenic', 'antifreeze', 'detergent', 'pesticide',
  'insecticide', 'rat poison', 'weed killer', 'herbicide', 'ammonia', 'drain cleaner',
  'tide pod', 'laundry pod', 'hand sanitizer', 'rubbing alcohol', 'isopropyl',
  'methanol', 'gasoline', 'petrol', 'kerosene', 'turpentine', 'paint thinner',
  // Non-food items
  'shoe', 'sock', 'dirt', 'sand', 'gravel', 'cement', 'concrete', 'plastic',
  'metal', 'glass', 'paper', 'cardboard', 'styrofoam', 'rubber',
  // Keep this minimal — Claude handles borderline cases
];

/**
 * Check ingredients list against blocklist.
 * Returns { safe: true } or { safe: false, reason: string }
 */
export function checkIngredientBlocklist(
  ingredients: string[]
): { safe: boolean; reason?: string } {
  for (const ingredient of ingredients) {
    const lower = ingredient.toLowerCase();
    for (const term of BLOCKED_TERMS) {
      if (lower.includes(term)) {
        return {
          safe: false,
          reason: `Blocked term: "${term}" in "${ingredient}"`,
        };
      }
    }
  }
  return { safe: true };
}

/**
 * Moderate a photo using Claude vision.
 * Returns { appropriate: true } or { appropriate: false, reason: string }
 */
export async function moderatePhoto(
  imageBase64: string,
  mediaType: string
): Promise<{ appropriate: boolean; reason?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { appropriate: true }; // fail open if no key

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Look at this image. Is it appropriate food/cooking content suitable for a family-friendly cooking website? Reply with JSON only: { "appropriate": true/false, "reason": "string" }. Flag as inappropriate if it contains: nudity, violence, gore, offensive content, non-food items being presented as food, or anything unsuitable for a general audience.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[Photo Moderation] API error:', response.status);
      return { appropriate: true }; // fail open
    }

    const data = await response.json();
    let text = data.content?.[0]?.text?.trim() || '';

    // Strip code fences
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    const result = JSON.parse(text);
    return {
      appropriate: result.appropriate === true,
      reason: result.reason,
    };
  } catch (err) {
    console.error('[Photo Moderation] Error:', err);
    return { appropriate: true }; // fail open
  }
}
