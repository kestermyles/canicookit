'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StylizedCamera } from '@/components/NoPhotoPlaceholder';

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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const [canHover, setCanHover] = useState(false);

  // Detect hover capability
  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches);
  }, []);

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

  // Close menu on click outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

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
        <div
          className="relative"
          ref={menuRef}
          onMouseEnter={() => {
            if (canHover) {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              setShowMenu(true);
            }
          }}
          onMouseLeave={() => {
            if (canHover) {
              hoverTimeout.current = setTimeout(() => setShowMenu(false), 200);
            }
          }}
        >
          <button
            onClick={() => { if (!canHover) setShowMenu(!showMenu); }}
            className="p-1.5 text-primary hover:text-orange-700 transition-colors"
            aria-label="Recipe options"
          >
            <StylizedCamera size={28} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
              <Link
                href="/generate?scan=true"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span>📷</span>
                <span>Scan your ingredients</span>
              </Link>
              <Link
                href="/generate"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span>✨</span>
                <span>Build a recipe</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
