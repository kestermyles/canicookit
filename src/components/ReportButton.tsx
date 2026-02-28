'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';

interface ReportButtonProps {
  recipeSlug: string;
  variant?: 'icon' | 'text';
  className?: string;
}

export default function ReportButton({ recipeSlug, variant = 'icon', className = '' }: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (reported || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/report-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: recipeSlug }),
      });

      if (response.ok) {
        setReported(true);
      }
    } catch (error) {
      console.error('Failed to report recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'text') {
    return (
      <button
        onClick={handleReport}
        disabled={reported || loading}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 ${className}`}
      >
        <Flag className="w-4 h-4" />
        {reported ? 'Reported' : 'Report'}
      </button>
    );
  }

  return (
    <button
      onClick={handleReport}
      disabled={reported || loading}
      className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 ${className}`}
      title={reported ? 'Reported for review' : 'Report this recipe'}
    >
      <Flag className="w-4 h-4" />
    </button>
  );
}
