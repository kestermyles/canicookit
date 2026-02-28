'use client';

import Link from 'next/link';

interface FilterPill {
  emoji: string;
  label: string;
  href: string;
}

const filters: FilterPill[] = [
  // Courses
  { emoji: '🍳', label: 'Breakfast', href: '/recipes/filter/breakfast' },
  { emoji: '🥗', label: 'Lunch', href: '/recipes/filter/lunch' },
  { emoji: '🍽️', label: 'Dinner', href: '/recipes/filter/dinner' },
  { emoji: '🥨', label: 'Snacks', href: '/recipes/filter/snacks' },
  { emoji: '🎂', label: 'Baking', href: '/recipes/filter/baking' },
  { emoji: '🍮', label: 'Desserts', href: '/recipes/filter/desserts' },
  { emoji: '🍹', label: 'Drinks', href: '/recipes/filter/drinks' },

  // Cuisines
  { emoji: '🌍', label: 'Italian', href: '/recipes/cuisine/italian' },
  { emoji: '🇬🇧', label: 'British', href: '/recipes/cuisine/british' },
  { emoji: '🌮', label: 'Mexican', href: '/recipes/cuisine/mexican' },
  { emoji: '🍜', label: 'Asian', href: '/recipes/cuisine/asian' },
  { emoji: '🥘', label: 'Spanish', href: '/recipes/cuisine/spanish' },

  // Diet
  { emoji: '🥦', label: 'Vegetarian', href: '/recipes/filter/vegetarian' },
];

export default function QuickFilterBar() {
  return (
    <div className="relative w-full mb-6">
      {/* Horizontal scroll container with hidden scrollbar */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.href}
              href={filter.href}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm"
            >
              <span className="text-base">{filter.emoji}</span>
              <span>{filter.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
