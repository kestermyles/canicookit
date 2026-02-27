import Link from 'next/link';

interface NoResultsCTAProps {
  searchQuery: string;
}

export default function NoResultsCTA({ searchQuery }: NoResultsCTAProps) {
  return (
    <div className="max-w-2xl mx-auto my-12 text-center">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 shadow-lg">
        <div className="text-6xl mb-4">🤔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          We don't have that one yet!
        </h2>
        <p className="text-gray-700 mb-6">
          But you can create it! Let our AI chef generate a recipe based on{' '}
          <span className="font-semibold text-orange-700">"{searchQuery}"</span>
        </p>

        <Link
          href={`/generate?q=${encodeURIComponent(searchQuery)}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-8 py-4 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="text-xl">✨</span>
          <span>Can I Cook It?</span>
        </Link>

        <p className="text-sm text-gray-600 mt-4">
          Generate a custom recipe in seconds
        </p>
      </div>
    </div>
  );
}
