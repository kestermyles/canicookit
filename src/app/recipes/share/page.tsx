'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import IngredientInput, { IngredientInputHandle } from '@/components/IngredientInput';

interface PolishedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  method: string;
  serves: number;
  cookTime: number;
  difficulty: string;
  vegetarian: boolean;
  vegan: boolean;
  dairyFree: boolean;
  glutenFree: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
}

function formatDifficulty(d: string): string {
  return d
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function ShareRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const ingredientInputRef = useRef<IngredientInputHandle>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(
    user?.user_metadata?.username || user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  );
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [method, setMethod] = useState('');
  const [serves, setServes] = useState(4);
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState('easy');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [confirmed, setConfirmed] = useState(false);

  // Flow state
  const [polishing, setPolishing] = useState(false);
  const [polishedRecipe, setPolishedRecipe] = useState<PolishedRecipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePolish = async () => {
    ingredientInputRef.current?.flush();

    if (!title.trim() || !authorName.trim() || !description.trim() || ingredients.length === 0 || !method.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setPolishing(true);
    setError('');

    try {
      const res = await fetch('/api/polish-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          authorName: authorName.trim(),
          description: description.trim(),
          ingredients,
          method: method.trim(),
          serves,
          cookTime,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to polish recipe');
      }

      setPolishedRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPolishing(false);
    }
  };

  const handleSave = async () => {
    if (!polishedRecipe) return;

    setSaving(true);
    setError('');

    try {
      // Build form data for photo upload
      const formData = new FormData();
      formData.append('title', polishedRecipe.title);
      formData.append('authorName', authorName.trim());
      formData.append('description', polishedRecipe.description);
      formData.append('ingredients', JSON.stringify(polishedRecipe.ingredients));
      formData.append('method', polishedRecipe.method);
      formData.append('serves', String(polishedRecipe.serves));
      formData.append('cookTime', String(polishedRecipe.cookTime));
      formData.append('difficulty', polishedRecipe.difficulty);
      formData.append('vegetarian', String(polishedRecipe.vegetarian || false));
      formData.append('vegan', String(polishedRecipe.vegan || false));
      formData.append('dairyFree', String(polishedRecipe.dairyFree || false));
      formData.append('glutenFree', String(polishedRecipe.glutenFree || false));
      formData.append('calories', String(polishedRecipe.calories || 0));
      formData.append('protein', String(polishedRecipe.protein || 0));
      formData.append('carbs', String(polishedRecipe.carbs || 0));
      formData.append('fat', String(polishedRecipe.fat || 0));
      formData.append('tags', JSON.stringify(polishedRecipe.tags || ['dinner']));
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await fetch('/api/save-shared-recipe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save recipe');
      }

      router.push(`/recipes/community/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  // Preview step
  if (polishedRecipe) {
    const methodSteps = polishedRecipe.method.split('\n').filter((s) => s.trim());

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 font-display">Here&apos;s how your recipe will look</h1>
        <p className="text-secondary mb-8">Check everything looks right before sharing with the community.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {photoPreview && (
            <div className="mb-6 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt={polishedRecipe.title} className="w-full h-auto" />
            </div>
          )}

          <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-3">
            From {authorName}&apos;s Kitchen
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">{polishedRecipe.title}</h2>
          <p className="text-secondary text-lg mb-4">
            Shared by {authorName} &mdash; {polishedRecipe.description}
          </p>

          {/* Dietary badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {polishedRecipe.vegetarian && (
              <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Vegetarian</span>
            )}
            {polishedRecipe.vegan && (
              <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Vegan</span>
            )}
            {polishedRecipe.dairyFree && (
              <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">Dairy Free</span>
            )}
            {polishedRecipe.glutenFree && (
              <span className="px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">Gluten Free</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-6">
            <div className="text-center px-4">
              <p className="text-sm text-secondary">Cook</p>
              <p className="font-semibold">{polishedRecipe.cookTime} mins</p>
            </div>
            <div className="text-center px-4">
              <p className="text-sm text-secondary">Serves</p>
              <p className="font-semibold">{polishedRecipe.serves}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-sm text-secondary">Difficulty</p>
              <p className="font-semibold">{formatDifficulty(polishedRecipe.difficulty)}</p>
            </div>
            {polishedRecipe.calories > 0 && (
              <div className="text-center px-4">
                <p className="text-sm text-secondary">Calories</p>
                <p className="font-semibold">{polishedRecipe.calories}</p>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <h3 className="text-lg font-bold mb-3">Ingredients</h3>
          <ul className="mb-6 space-y-1.5">
            {polishedRecipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-primary mt-0.5">&#x2022;</span>
                {ing}
              </li>
            ))}
          </ul>

          {/* Method */}
          <h3 className="text-lg font-bold mb-3">Method</h3>
          <div className="space-y-3">
            {methodSteps.map((step, i) => (
              <p key={i} className="text-gray-700">{step}</p>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Looks great \u2014 share it! \u2192'}
          </button>
          <button
            onClick={() => setPolishedRecipe(null)}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            &larr; Edit
          </button>
        </div>
      </div>
    );
  }

  // Form step
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 font-display">Share a recipe with the community</h1>
      <p className="text-secondary mb-8">
        Got an old family recipe, or something you absolutely love and want the world to try? Add it
        here with your steps, ingredients and a photograph &mdash; and we&apos;ll share it with our
        community of cooks.
      </p>

      <div className="space-y-6">
        {/* Recipe name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Nana's Shepherd's Pie"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Author name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your name (so we can credit you) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us a little about this dish and why you love it..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredients <span className="text-red-500">*</span>
          </label>
          <IngredientInput
            ref={ingredientInputRef}
            ingredients={ingredients}
            onChange={setIngredients}
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Method / Steps <span className="text-red-500">*</span>
          </label>
          <textarea
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Walk us through how to make it, step by step..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        {/* Serves + Cook time + Difficulty */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serves</label>
            <input
              type="number"
              value={serves}
              onChange={(e) => setServes(Number(e.target.value) || 4)}
              min={1}
              max={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cook time (mins)</label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value) || 30)}
              min={1}
              max={480}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="easy">Easy</option>
              <option value="getting-somewhere">Getting Somewhere</option>
              <option value="weekend-cook">Weekend Cook</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add a photo (strongly encouraged &mdash; recipes with photos get far more cooks!)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors text-sm text-secondary flex-1 text-center">
              {photo ? photo.name : 'Click to choose a photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            I confirm this is my own original recipe and any photos are my own.
          </span>
        </label>

        {/* Submit */}
        <button
          onClick={handlePolish}
          disabled={polishing || !confirmed}
          className="w-full px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {polishing ? 'Polishing your recipe...' : 'Polish & Preview \u2192'}
        </button>

        <p className="text-xs text-gray-500">
          By sharing your recipe, you confirm this is your own original work or your own adaptation, and that any photos are your own. Can I Cook It? is a community platform &mdash; if you believe any content on our site infringes your copyright, please let us know at{' '}
          <a href="mailto:hello@canicookit.com" className="underline hover:text-gray-600">hello@canicookit.com</a>{' '}
          and we will remove it promptly.
        </p>
      </div>
    </div>
  );
}
