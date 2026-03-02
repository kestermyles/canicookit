'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PLACEHOLDERS = [
  'Try: leftover chicken, rice, half a courgette...',
  'Try: beef, red wine, mushrooms...',
  'Try: eggs, spinach, feta...',
  'Try: salmon, lemon, capers...',
  'Try: mince, potatoes, onions...',
  'Try: prawns, garlic, chilli, pasta...',
  'Try: sweet potato, coconut milk, ginger...',
  'Try: chicken thighs, chorizo, peppers...',
  'Try: beef bourguignon',
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
        className={`w-full px-6 py-4 pr-14 text-lg rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-all ${
          fadeOut ? 'placeholder:opacity-0' : 'placeholder:opacity-100'
        }`}
        style={{ transition: 'placeholder 0.3s ease-in-out' }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button
            onClick={onClear}
            className="text-secondary hover:text-foreground text-xl p-1"
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
        <Link
          href="/generate"
          className="p-1.5 text-primary hover:text-orange-700 transition-colors"
          aria-label="Scan ingredients"
        >
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 19.79 13.79 18 16 18H48C50.21 18 52 19.79 52 22V46C52 48.21 50.21 50 48 50H16C13.79 50 12 48.21 12 46V22Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="32" cy="34" r="9" stroke="currentColor" strokeWidth="3" />
            <path d="M24 18C24 18 26 14 28 14H36C38 14 40 18 40 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
