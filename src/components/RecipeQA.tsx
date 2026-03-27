'use client';

import { useState, useEffect, useRef } from 'react';

const PLACEHOLDER_QUESTIONS = [
  'e.g. What can I swap for paprika?',
  "e.g. I don't have a wok — what do I use?",
  'e.g. How do I know when the chicken is cooked?',
  'e.g. Can I make this the night before?',
  'e.g. How do I stop the sauce splitting?',
  'e.g. What wine would go with this?',
  'e.g. Can I freeze the leftovers?',
  'e.g. How do I make this spicier?',
  'e.g. What sides would work with this?',
  'e.g. Can I use dried herbs instead of fresh?',
];

interface RecipeQAProps {
  recipeTitle: string;
  recipeDescription: string;
  ingredients: string[];
}

export default function RecipeQA({ recipeTitle, recipeDescription, ingredients }: RecipeQAProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder text with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_QUESTIONS.length);
        setFadeIn(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setAnswer('');
    setError('');

    try {
      const res = await fetch('/api/recipe-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          recipeTitle,
          recipeDescription,
          ingredients,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to get an answer. Please try again.');
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4 font-handwritten">Got a question while you&apos;re cooking?</h2>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          {!question && (
            <span
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
            >
              {PLACEHOLDER_QUESTIONS[placeholderIndex]}
            </span>
          )}
        </div>
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      {/* Answer */}
      {loading && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium">Thinking...</span>
          </div>
        </div>
      )}

      {answer && !loading && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <p className="text-gray-800 leading-relaxed">{answer}</p>
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </section>
  );
}
