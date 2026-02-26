#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('\n--- New Recipe ---\n');

  const title = await ask('Recipe title: ');
  const cuisine = await ask('Cuisine (e.g., italian, mexican, british): ');

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const date = new Date().toISOString().split('T')[0];

  const template = `---
title: "${title}"
slug: "${slug}"
cuisine: "${cuisine.toLowerCase()}"
description: ""
ingredients:
  - ""
difficulty: "easy"
prepTime: 0
cookTime: 0
serves: 4
budget: "cheap"
studentKitchen: false
vegetarian: false
vegan: false
dairyFree: false
glutenFree: false
calories: 0
protein: 0
carbs: 0
fat: 0
heroImage: "/images/recipes/${slug}.jpg"
images: []
videoUrl: ""
tags:
  - ""
# Created: ${date}
---

## Method

1.
`;

  const dir = path.join(process.cwd(), 'recipes', cuisine.toLowerCase());

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    const overwrite = await ask('File already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      rl.close();
      return;
    }
  }

  fs.writeFileSync(filePath, template);

  console.log(`\nCreated: recipes/${cuisine.toLowerCase()}/${slug}.md`);
  console.log(
    `Add a hero image at: public/images/recipes/${slug}.jpg\n`
  );

  rl.close();
}

main().catch(console.error);
