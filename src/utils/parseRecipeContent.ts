/**
 * Extract detailed ingredient lines from markdown content.
 * Looks for the section between "## Ingredients" and the next "## " heading.
 * Returns list items (lines starting with "- ") without the dash prefix.
 */
export function extractIngredients(markdown: string): string[] {
  const lines = markdown.split('\n');
  let inIngredients = false;
  const ingredients: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Start capturing after "## Ingredients"
    if (/^##\s+Ingredients/i.test(trimmed)) {
      inIngredients = true;
      continue;
    }

    // Stop at the next ## heading
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
 * 2. The <h2>Ingredients</h2> section up to the next <h2>
 */
export function stripIngredientsHtml(html: string): string {
  // Remove everything before the first <h2> (title, description)
  let cleaned = html.replace(/^[\s\S]*?(?=<h2)/i, '');
  // Remove the Ingredients section
  cleaned = cleaned.replace(
    /<h2[^>]*>Ingredients<\/h2>[\s\S]*?(?=<h2[^>]*>|$)/i,
    ''
  );
  return cleaned;
}
