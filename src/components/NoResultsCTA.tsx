import Link from 'next/link';

interface NoResultsCTAProps {
  searchQuery: string;
}

function detectInputType(query: string): 'dish' | 'ingredients' {
  // Check if it looks like ingredients (contains commas or is 4+ words)
  const hasCommas = query.includes(',');
  const wordCount = query.trim().split(/\s+/).length;

  if (hasCommas || wordCount >= 4) {
    return 'ingredients';
  }

  // Otherwise treat as dish name (1-3 words, no commas)
  return 'dish';
}

export default function NoResultsCTA({ searchQuery }: NoResultsCTAProps) {
  const inputType = detectInputType(searchQuery);
  const isDish = inputType === 'dish';

  const urlParam = isDish ? 'dish' : 'ingredients';
  const message = isDish
    ? "We don't have that yet — want us to create it?"
    : "Looks like ingredients! Let's create something.";

  return (
    <div className="max-w-2xl mx-auto my-12 text-center">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 shadow-lg">
        <div className="text-6xl mb-4">{isDish ? '🤔' : '🥘'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {message}
        </h2>
        <p className="text-gray-700 mb-6">
          {isDish ? (
            <>
              We'll create a recipe for{' '}
              <span className="font-semibold text-orange-700">"{searchQuery}"</span>
            </>
          ) : (
            <>
              We'll build a recipe using{' '}
              <span className="font-semibold text-orange-700">"{searchQuery}"</span>
            </>
          )}
        </p>

        <Link
          href={`/generate?${urlParam}=${encodeURIComponent(searchQuery)}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-8 py-4 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="text-xl">✨</span>
          <span>Create This Recipe</span>
        </Link>

        <p className="text-sm text-gray-600 mt-4">
          Custom recipe created in seconds
        </p>
      </div>
    </div>
  );
}
