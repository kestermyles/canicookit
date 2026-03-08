// Headings that mark the start of the ingredients section
const INGREDIENT_HEADINGS = /^##\s+(Ingredients|What you need|What you'll need)/i;

/**
 * Extract detailed ingredient lines from markdown content.
 * Looks for the section between an ingredient heading and the next ## heading.
 * Returns list items (lines starting with "- ") without the dash prefix.
 */
export function extractIngredients(markdown: string): string[] {
  const lines = markdown.split('\n');
  let inIngredients = false;
  const ingredients: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Start capturing after an ingredient heading
    if (INGREDIENT_HEADINGS.test(trimmed)) {
      inIngredients = true;
      continue;
    }

    // Stop at the next ## heading (but not ### sub-headings)
    if (inIngredients && /^##\s+/.test(trimmed) && !/^###/.test(trimmed)) {
      break;
    }

    // Capture list items
    if (inIngredients && trimmed.startsWith('- ')) {
      ingredients.push(trimmed.slice(2).trim());
    }
  }

  return ingredients;
}

/**
 * Strip the Ingredients section and leading title/description from rendered HTML.
 * Removes:
 * 1. Everything before the first <h2> (the H1 title and intro paragraph)
 * 2. The ingredient section (matching various heading names) up to the next <h2>
 */
export function stripIngredientsHtml(html: string): string {
  // Remove everything before the first <h2> (title, description)
  let cleaned = html.replace(/^[\s\S]*?(?=<h2)/i, '');
  // Remove the Ingredients / What you need section
  cleaned = cleaned.replace(
    /<h2[^>]*>(?:Ingredients|What you need|What you&#39;ll need|What you'll need)<\/h2>[\s\S]*?(?=<h2[^>]*>|$)/i,
    ''
  );
  return cleaned;
}
