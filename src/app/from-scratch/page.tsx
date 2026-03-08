import Link from 'next/link';
import { Metadata } from 'next';
import { getRecipesByCuisine } from '@/lib/recipes';
import { Flame, Clock, ChefHat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'From Scratch — Can I Cook It?',
  description:
    'Some things are worth the time. Real bread. Proper roasts. Made from scratch.',
};

function formatLabel(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function FromScratchPage() {
  const recipes = await getRecipesByCuisine('from-scratch');

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="py-16 md:py-24 text-center max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <Flame className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">
          From Scratch
        </h1>
        <p className="text-xl md:text-2xl text-secondary leading-relaxed">
          Some things are worth the time. Real bread. Proper roasts. Made from
          scratch.
        </p>
        <p className="text-secondary mt-4">
          Long-form, multi-stage recipes for when you want to do it properly.
        </p>
      </section>

      {/* Recipe Cards */}
      {recipes.length > 0 ? (
        <section className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.slug}
                href={`/from-scratch/${recipe.slug}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                {recipe.heroImage ? (
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.heroImage}
                      alt={recipe.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium bg-black/50 text-white rounded-full">
                      {formatLabel(recipe.difficulty)}
                    </span>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-light-grey flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-display">
                    {recipe.title}
                  </h2>
                  <p className="text-secondary text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.prepTime} min active
                    </span>
                    <span>Serves {recipe.serves}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="pb-16 text-center">
          <p className="text-secondary text-lg">
            From Scratch recipes coming soon.
          </p>
        </section>
      )}
    </div>
  );
}
