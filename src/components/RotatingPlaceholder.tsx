'use client';

import { useState, useEffect } from 'react';

const PLACEHOLDERS = [
  'Try: leftover chicken, rice, half a courgette...',
  'Try: beef, red wine, mushrooms...',
  'Try: eggs, spinach, feta...',
  'Try: salmon, lemon, capers...',
  'Try: mince, potatoes, onions...',
  'Try: prawns, garlic, chilli, pasta...',
  'Try: sweet potato, coconut milk, ginger...',
  'Try: chicken thighs, chorizo, peppers...',
  'Try: beef burgundy',
  'Try: shepherd\'s pie',
  'Try: pad thai',
  'Try: Texas chili',
  'Try: mushroom risotto',
  'Try: chicken tikka masala',
  'Try: beef Wellington',
  'Try: whatever\'s in your fridge...',
  'Try: last night\'s leftovers...',
  'Try: lamb shanks, rosemary, red wine...',
  'Try: halloumi, courgette, mint...',
  'Try: banana, oats, peanut butter...',
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
