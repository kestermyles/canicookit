'use client';

import { useState, useEffect } from 'react';
import { PANTRY_ESSENTIALS } from '@/types/generator';

export default function EssentialsPanel() {
  const [isOpen, setIsOpen] = useState(true);

  // Collapse by default on mobile
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="bg-light-grey p-4 sm:p-6 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between sm:cursor-default"
      >
        <p className="text-sm text-secondary">
          {isOpen ? "We'll assume you have these basics" : "We'll assume you have the basics"}
        </p>
        <svg
          className={`w-4 h-4 text-secondary transition-transform sm:hidden ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="flex flex-wrap gap-2 mt-3">
          {PANTRY_ESSENTIALS.map((essential) => (
            <span
              key={essential}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-secondary rounded-full text-xs sm:text-sm"
            >
              {essential.replace(/\s*\(.*?\)$/, '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
