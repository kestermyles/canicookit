'use client';

import { useState } from 'react';
import { GeneratedRecipeData } from '@/types/generator';
import CookItMyWay from './CookItMyWay';

interface GeneratedRecipeProps {
  recipe: GeneratedRecipeData;
  onSave: () => void;
  isSaving: boolean;
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  savedSlug?: string | null;
}

function isBatchRecipe(tags: string[] = []): boolean {
  const batchKeywords = ['cookies', 'biscuits', 'brownies', 'muffins', 'cupcakes', 'scones', 'flapjacks', 'traybakes', 'bars'];
  return batchKeywords.some(kw => tags.some(tag => tag.toLowerCase().includes(kw)));
}

function formatLabel(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function GeneratedRecipe({
  recipe,
  onSave,
  isSaving,
  userName,
  userEmail,
  savedSlug,
}: GeneratedRecipeProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailAddress, setEmailAddress] = useState(userEmail || '');
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
            AI Created Recipe
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
          <p className="text-secondary text-lg">{recipe.description}</p>
        </div>

        {/* Dietary badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.vegetarian && (
            <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              Vegetarian
            </span>
          )}
          {recipe.vegan && (
            <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              Vegan
            </span>
          )}
          {recipe.dairyFree && (
            <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
              Dairy Free
            </span>
          )}
          {recipe.glutenFree && (
            <span className="px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">
              Gluten Free
            </span>
          )}
          {recipe.studentKitchen && (
            <span className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
              Student Kitchen
            </span>
          )}
        </div>

        {/* Difficulty + Quick Stats */}
        <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-8">
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Difficulty</p>
            <p className="font-semibold">{formatLabel(recipe.difficulty)}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Total</p>
            <p className="font-semibold">{totalTime} mins</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">{isBatchRecipe(recipe.tags) ? 'Makes' : 'Serves'}</p>
            <p className="font-semibold">{recipe.serves}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-sm text-secondary">Budget</p>
            <p className="font-semibold">{formatLabel(recipe.budget)}</p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Ingredients</h2>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Shopping List Email — right below ingredients */}
        <div className="mb-8">
          {emailSent ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Done! Check your inbox 📬
            </div>
          ) : !showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="px-6 py-2.5 border border-gray-300 text-gray-500 bg-white rounded-full hover:border-gray-400 hover:text-gray-700 transition-colors font-medium text-sm"
            >
              Send me the shopping list &rarr;
            </button>
          ) : (
            <div className="max-w-sm bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">Get your shopping list by email</p>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={emailSending}
              />
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribeToNewsletter}
                  onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={emailSending}
                />
                <span className="text-xs text-gray-600 leading-snug">
                  Keep me updated with recipes and news from Can I Cook It?
                </span>
              </label>
              {emailError && (
                <p className="mt-2 text-xs text-red-600">{emailError}</p>
              )}
              <button
                onClick={async () => {
                  if (!emailAddress.trim()) return;
                  setEmailSending(true);
                  setEmailError('');
                  try {
                    const res = await fetch('/api/send-shopping-list', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: emailAddress.trim(),
                        recipeTitle: recipe.title,
                        ingredients: recipe.ingredients,
                        recipeSlug: savedSlug || null,
                        subscribeToNewsletter,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok || data.error) {
                      throw new Error(data.error || 'Failed to send');
                    }
                    setEmailSent(true);
                  } catch {
                    setEmailError('Something went wrong — please try again.');
                  } finally {
                    setEmailSending(false);
                  }
                }}
                disabled={emailSending || !emailAddress.trim()}
                className="mt-3 w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {emailSending ? 'Sending...' : 'Send it →'}
              </button>
              <p className="mt-2 text-xs text-gray-400 text-center">
                We&apos;ll never spam you. Unsubscribe any time.
              </p>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-10 py-4 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-xl shadow-lg"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Yum! Can I Cook It? →'
            )}
          </button>

          <CookItMyWay
            originalTitle={recipe.title}
            originalDescription={recipe.description}
            originalIngredients={recipe.ingredients}
            originalMethod={recipe.method || []}
            defaultName={userName}
          />
        </div>
      </div>
    </div>
  );
}
