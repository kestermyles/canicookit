import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cooking Guides & Tips',
  description: 'Learn essential cooking techniques, hosting tips, and kitchen skills with our step-by-step guides.',
};

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
          Cooking Guides
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Master essential techniques, learn hosting tips, and build confidence in the kitchen with our detailed step-by-step guides.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group block bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
          >
            {/* Icon */}
            <div className="text-5xl mb-4">{guide.icon}</div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-display">
              {guide.title}
            </h2>

            {/* Description */}
            <p className="text-secondary text-sm mb-4 line-clamp-2">
              {guide.description}
            </p>

            {/* Read Time */}
            <div className="flex items-center gap-2 text-xs text-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {guide.readTime}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
