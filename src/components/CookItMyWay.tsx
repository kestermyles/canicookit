'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CookItMyWayProps {
  originalSlug?: string;
  originalTitle: string;
  originalDescription: string;
  originalIngredients: string[];
  originalMethod: string[];
  defaultName?: string;
}

export default function CookItMyWay({
  originalSlug,
  originalTitle,
  originalDescription,
  originalIngredients,
  originalMethod,
  defaultName,
}: CookItMyWayProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [adaptations, setAdaptations] = useState('');
  const [authorName, setAuthorName] = useState(defaultName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!adaptations.trim() || !authorName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/adapt-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalSlug,
          originalTitle,
          originalDescription,
          originalIngredients,
          originalMethod,
          adaptations: adaptations.trim(),
          authorName: authorName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create your version');
      }

      router.push(`/recipes/community/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-3 border-2 border-primary text-primary bg-white rounded-full hover:bg-orange-50 transition-colors font-bold text-lg"
      >
        Cook it My Way &rarr;
      </button>
    );
  }

  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-1">Your kitchen, your rules</h3>
      <p className="text-secondary text-sm mb-4">
        Tell us what you&apos;d change and we&apos;ll build your version
      </p>

      <textarea
        value={adaptations}
        onChange={(e) => setAdaptations(e.target.value)}
        placeholder="e.g. I'd add chorizo, swap the couscous for orzo, make it spicier..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        rows={3}
        disabled={loading}
      />

      <input
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name (for the credit)"
        className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        disabled={loading}
      />

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !adaptations.trim() || !authorName.trim()}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Cooking up your version...' : 'Create My Version \u2192'}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          disabled={loading}
          className="px-4 py-3 text-secondary hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
