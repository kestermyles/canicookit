export interface RecipeFrontmatter {
  title: string;
  slug: string;
  cuisine: string;
  description: string;
  ingredients: string[];
  difficulty: 'easy' | 'getting-somewhere' | 'weekend-cook';
  prepTime: number;
  cookTime: number;
  serves: number;
  budget: 'cheap' | 'reasonable' | 'splash-out';
  studentKitchen: boolean;
  vegetarian: boolean;
  vegan: boolean;
  dairyFree: boolean;
  glutenFree: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  heroImage: string;
  images?: string[];
  videoUrl?: string;
  tags: string[];
}

export interface Recipe extends RecipeFrontmatter {
  content: string;
  contentHtml: string;
}

export interface RecipeSearchItem {
  title: string;
  slug: string;
  cuisine: string;
  description: string;
  ingredients: string[];
  tags: string[];
  heroImage: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  calories: number;
  budget: string;
}
