import { NextResponse } from 'next/server';
import { createRecipe, uploadPhoto, updateRecipePhoto } from '@/lib/supabase';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const authorName = formData.get('authorName') as string;
    const description = formData.get('description') as string;
    const ingredients = JSON.parse(formData.get('ingredients') as string);
    const methodText = formData.get('method') as string;
    const serves = parseInt(formData.get('serves') as string) || 4;
    const cookTime = parseInt(formData.get('cookTime') as string) || 30;
    const difficulty = formData.get('difficulty') as string || 'easy';
    const vegetarian = formData.get('vegetarian') === 'true';
    const vegan = formData.get('vegan') === 'true';
    const dairyFree = formData.get('dairyFree') === 'true';
    const glutenFree = formData.get('glutenFree') === 'true';
    const calories = parseInt(formData.get('calories') as string) || 0;
    const protein = parseInt(formData.get('protein') as string) || 0;
    const carbs = parseInt(formData.get('carbs') as string) || 0;
    const fat = parseInt(formData.get('fat') as string) || 0;
    const tags = JSON.parse(formData.get('tags') as string || '["dinner"]');
    const photo = formData.get('photo') as File | null;

    if (!title || !authorName || !description || !ingredients?.length || !methodText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse method text into steps array
    const method = methodText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s)
      .map((s) => s.replace(/^\d+\.\s*/, ''));

    // Generate slug
    const timestamp = Date.now().toString(36);
    const slug = `${slugify(title)}-${timestamp}`;

    // Prefix description with author credit
    const fullDescription = `Shared by ${authorName} — ${description}`;

    // Save to database
    const { success, error: saveError } = await createRecipe({
      slug,
      title,
      description: fullDescription,
      ingredients,
      method,
      prep_time: 0,
      cook_time: cookTime,
      serves,
      difficulty,
      budget: 'reasonable',
      calories,
      protein,
      carbs,
      fat,
      vegetarian,
      vegan,
      dairy_free: dairyFree,
      gluten_free: glutenFree,
      student_kitchen: false,
      tags,
      user_name: authorName,
    });

    if (!success) {
      throw new Error(saveError || 'Failed to save recipe');
    }

    // Upload photo if provided
    if (photo && photo.size > 0) {
      try {
        const uploadResult = await uploadPhoto(photo);
        if (uploadResult.success && uploadResult.url) {
          await updateRecipePhoto(slug, uploadResult.url, false);
        }
      } catch (err) {
        console.error('[Save Shared Recipe] Photo upload failed:', err);
        // Continue — recipe is saved, photo just didn't upload
      }
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[Save Shared Recipe] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
