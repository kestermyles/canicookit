# Can I Cook It?

Simple recipes for real people. No fuss, no jargon — just food you'll actually want to cook.

**Live site:** [canicookit.com](https://canicookit.com)

## Adding a New Recipe

### Three-step workflow

1. **Create the recipe file**

   ```bash
   npm run new-recipe
   ```

   Follow the prompts. This creates a markdown file with the correct frontmatter template in `recipes/[cuisine]/[slug].md`.

2. **Add your content**

   Open the generated `.md` file and fill in:
   - All frontmatter fields (title, description, ingredients, nutrition, etc.)
   - The method steps in the markdown body (use numbered list: `1. Do this`, `2. Then this`)

3. **Add your photos**

   Drop your hero image into `public/images/recipes/` with the same filename as the slug (e.g., `pasta-carbonara.jpg`). Add any extra images to the same folder and reference them in the `images` array in frontmatter.

That's it. Commit, push, and Vercel deploys automatically.

## Recipe File Structure

```
recipes/
├── _template.md              # Blank template for reference
├── italian/
│   ├── pasta-carbonara.md
│   └── ...
├── mexican/
│   └── chicken-tacos.md
└── british/
    └── ...
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deployment

Push to your GitHub repo. Vercel deploys automatically on every push to `main`.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Search:** Fuse.js (client-side)
- **Content:** Markdown with gray-matter frontmatter
- **Deployment:** Vercel
