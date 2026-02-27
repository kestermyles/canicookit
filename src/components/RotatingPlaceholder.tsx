'use client';

import { useState, useEffect } from 'react';

const PLACEHOLDERS = [
  // Ingredient combinations
  'Try: leftover chicken, rice, half a courgette...',
  'Try: eggs, spinach, feta...',
  'Try: minced beef, tinned tomatoes, pasta...',
  'Try: salmon, lemon, capers...',
  'Try: banana, oats, peanut butter...',
  'Try: chicken thighs, potatoes, garlic...',
  'Try: bacon, mushrooms, cream...',
  'Try: prawns, chilli, garlic, spaghetti...',
  'Try: lamb mince, aubergine, cinnamon...',
  'Try: white fish, cherry tomatoes, olives...',
  'Try: pork belly, apples, cider...',
  'Try: chorizo, chickpeas, spinach...',
  'Try: tofu, soy sauce, ginger, pak choi...',

  // Dish names
  'Try: beef bourguignon',
  'Try: shepherd\'s pie',
  'Try: chicken tikka masala',
  'Try: carbonara',
  'Try: fish pie',
  'Try: lasagne',
  'Try: moussaka',
  'Try: thai green curry',
  'Try: pad thai',
  'Try: coq au vin',
  'Try: beef wellington',
];

interface RotatingPlaceholderProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function RotatingPlaceholder({
  value,
  onChange,
  onClear,
}: RotatingPlaceholderProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFadeOut(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={PLACEHOLDERS[placeholderIndex]}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-all ${
          fadeOut ? 'placeholder:opacity-0' : 'placeholder:opacity-100'
        }`}
        style={{ transition: 'placeholder 0.3s ease-in-out' }}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground text-xl"
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
