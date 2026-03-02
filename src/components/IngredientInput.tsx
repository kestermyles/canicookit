'use client';

import { useState, KeyboardEvent } from 'react';

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export default function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addIngredient = (value: string) => {
    const trimmed = value.trim().toLowerCase();

    // Don't add empty strings or duplicates
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed]);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(inputValue);
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && ingredients.length > 0) {
      // Remove last ingredient if backspace on empty input
      onChange(ingredients.slice(0, -1));
    }
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 max-w-full overflow-hidden">
      <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg focus-within:border-primary transition-colors max-w-full">
        {ingredients.map((ingredient, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-full text-sm max-w-full"
          >
            <span className="truncate">{ingredient}</span>
            <button
              onClick={() => removeIngredient(index)}
              className="hover:bg-orange-700 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${ingredient}`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ingredients.length === 0 ? "e.g. chicken, lemon, pad thai..." : ""}
          className="flex-1 min-w-0 w-20 outline-none text-sm"
        />
      </div>
      <p className="text-xs sm:text-sm text-secondary">
        Ingredients or dish names — press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-xs">Enter</kbd> to add
      </p>
    </div>
  );
}
