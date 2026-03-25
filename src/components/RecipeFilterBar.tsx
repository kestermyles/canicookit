import Link from 'next/link';

const COURSES = [
  { label: 'Breakfast', filter: 'breakfast' },
  { label: 'Lunch', filter: 'lunch' },
  { label: 'Dinner', filter: 'dinner' },
  { label: 'Snacks', filter: 'snacks' },
  { label: 'Baking', filter: 'baking' },
  { label: 'Starters', filter: 'starters' },
  { label: 'Desserts', filter: 'desserts' },
  { label: 'Drinks', filter: 'drinks' },
];

const CUISINES = [
  { label: 'Italian', filter: 'italian' },
  { label: 'British', filter: 'british' },
  { label: 'Mexican', filter: 'mexican' },
  { label: 'Asian', filter: 'asian' },
  { label: 'French', filter: 'french' },
  { label: 'Indian', filter: 'indian' },
  { label: 'American', filter: 'american' },
];

interface RecipeFilterBarProps {
  activeFilter?: string | null;
}

export default function RecipeFilterBar({ activeFilter }: RecipeFilterBarProps) {
  const active = activeFilter?.toLowerCase() || '';

  return (
    <div className="mb-10 space-y-4">
      {/* Course filters */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">By course</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {COURSES.map((course) => (
            <Link
              key={course.filter}
              href={`/recipes/filter/${course.filter}`}
              className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors ${
                active === course.filter
                  ? 'bg-primary text-white border-primary'
                  : 'border-orange-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary'
              }`}
            >
              {course.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Cuisine filters */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">By cuisine</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CUISINES.map((cuisine) => (
            <Link
              key={cuisine.filter}
              href={`/recipes/cuisine/${cuisine.filter}`}
              className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors ${
                active === cuisine.filter
                  ? 'bg-primary text-white border-primary'
                  : 'border-orange-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary'
              }`}
            >
              {cuisine.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
