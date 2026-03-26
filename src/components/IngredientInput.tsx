'use client';

import { useState, useRef, KeyboardEvent, useImperativeHandle, forwardRef } from 'react';

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  onInputChange?: (value: string) => void;
}

// Common multi-word ingredients that should NOT be treated as dish names
const MULTI_WORD_INGREDIENTS = new Set([
  'olive oil', 'sesame oil', 'coconut oil', 'vegetable oil', 'sunflower oil',
  'soy sauce', 'fish sauce', 'hot sauce', 'tomato sauce', 'worcestershire sauce',
  'baking powder', 'baking soda', 'brown sugar', 'caster sugar', 'icing sugar',
  'black pepper', 'white pepper', 'cayenne pepper', 'bell pepper', 'chilli flakes',
  'cream cheese', 'sour cream', 'double cream', 'coconut milk', 'coconut cream',
  'spring onion', 'red onion', 'white onion', 'green beans', 'kidney beans',
  'tinned tomatoes', 'cherry tomatoes', 'sun dried tomatoes', 'tomato paste', 'tomato puree',
  'chicken breast', 'chicken thigh', 'minced beef', 'ground beef', 'pork belly',
  'plain flour', 'self raising flour', 'bread flour', 'rice flour', 'corn flour',
  'stock cubes', 'chicken stock', 'beef stock', 'vegetable stock',
  'dried herbs', 'mixed herbs', 'bay leaf', 'fresh basil', 'fresh mint',
  'lemon juice', 'lime juice', 'apple cider vinegar', 'red wine vinegar',
  'peanut butter', 'maple syrup', 'vanilla extract',
]);

function isDishName(value: string): boolean {
  if (!value.includes(' ')) return false;
  return !MULTI_WORD_INGREDIENTS.has(value.toLowerCase());
}

export interface IngredientInputHandle {
  /** Adds any pending input text as an ingredient. Returns the value if one was added, null otherwise. */
  flush: () => string | null;
}

const IngredientInput = forwardRef<IngredientInputHandle, IngredientInputProps>(
  function IngredientInput({ ingredients, onChange, onInputChange }, ref) {
  const [inputValue, setInputValue] = useState('');
  const ingredientsRef = useRef(ingredients);
  ingredientsRef.current = ingredients;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const normaliseIngredient = async (text: string): Promise<string> => {
    try {
      const res = await fetch('/api/normalise-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: text }),
      });
      const data = await res.json();
      return data.corrected || text;
    } catch {
      return text;
    }
  };

  const addIngredient = (value: string) => {
    const trimmed = value.trim().toLowerCase();

    // Don't add empty strings or duplicates
    if (!trimmed || ingredients.includes(trimmed)) {
      setInputValue('');
      onInputChange?.('');
      return;
    }

    // Add immediately, then correct in place
    onChange([...ingredients, trimmed]);
    setInputValue('');
    onInputChange?.('');

    // Fire-and-forget normalisation
    normaliseIngredient(trimmed).then((corrected) => {
      if (corrected && corrected !== trimmed) {
        const current = ingredientsRef.current;
        const idx = current.lastIndexOf(trimmed);
        if (idx === -1 || current.includes(corrected)) return;
        const updated = [...current];
        updated[idx] = corrected;
        onChangeRef.current(updated);
      }
    });
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

  useImperativeHandle(ref, () => ({
    flush: (): string | null => {
      const trimmed = inputValue.trim().toLowerCase();
      if (trimmed) {
        addIngredient(inputValue);
        return trimmed;
      }
      return null;
    },
  }));

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 max-w-full overflow-hidden">
      <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg focus-within:border-primary transition-colors max-w-full">
        {ingredients.map((ingredient, index) => {
          const dish = isDishName(ingredient);
          return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm max-w-full text-white bg-primary"
          >
            <span className="truncate">{ingredient}</span>
            <button
              onClick={() => removeIngredient(index)}
              className="rounded-full p-0.5 transition-colors hover:bg-orange-700"
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
          );
        })}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onInputChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={ingredients.length === 0 ? "e.g. chicken, lemon, pad thai..." : ""}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          name="ingredient-input-nofill"
          data-lpignore="true"
          data-1p-ignore="true"
          className="flex-1 min-w-0 w-20 outline-none text-sm"
        />
      </div>
      <p className="text-xs sm:text-sm text-secondary">
        Ingredients or dish names — press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-xs">Enter</kbd> to add
      </p>
    </div>
  );
});

export default IngredientInput;
