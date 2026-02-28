'use client';

import Link from 'next/link';
import {
  Coffee,
  Salad,
  UtensilsCrossed,
  Cookie,
  CakeSlice,
  IceCream,
  Wine,
  Globe,
  Flag,
  Pizza,
  Soup,
  Croissant,
  Leaf
} from 'lucide-react';

interface FilterPill {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const filters: FilterPill[] = [
  // Courses
  { icon: Coffee, label: 'Breakfast', href: '/recipes/filter/breakfast' },
  { icon: Salad, label: 'Lunch', href: '/recipes/filter/lunch' },
  { icon: UtensilsCrossed, label: 'Dinner', href: '/recipes/filter/dinner' },
  { icon: Cookie, label: 'Snacks', href: '/recipes/filter/snacks' },
  { icon: CakeSlice, label: 'Baking', href: '/recipes/filter/baking' },
  { icon: IceCream, label: 'Desserts', href: '/recipes/filter/desserts' },
  { icon: Wine, label: 'Drinks', href: '/recipes/filter/drinks' },

  // Cuisines
  { icon: Pizza, label: 'Italian', href: '/recipes/cuisine/italian' },
  { icon: Flag, label: 'British', href: '/recipes/cuisine/british' },
  { icon: Croissant, label: 'Mexican', href: '/recipes/cuisine/mexican' },
  { icon: Soup, label: 'Asian', href: '/recipes/cuisine/asian' },
  { icon: Globe, label: 'Spanish', href: '/recipes/cuisine/spanish' },

  // Diet
  { icon: Leaf, label: 'Vegetarian', href: '/recipes/filter/vegetarian' },
];

export default function QuickFilterBar() {
  return (
    <div className="relative w-full mb-6">
      {/* Horizontal scroll container with hidden scrollbar */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-2">
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <Link
                key={filter.href}
                href={filter.href}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm"
              >
                <IconComponent className="w-4 h-4" />
                <span>{filter.label}</span>
              </Link>
            );
          })}
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
