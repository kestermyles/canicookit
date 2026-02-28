'use client';

import { useEffect, useState } from 'react';
import { ChefHat, Trophy } from 'lucide-react';

interface Contributor {
  name: string;
  email: string;
  count: number;
}

export default function TopCooks() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopContributors() {
      try {
        const response = await fetch('/api/top-contributors');
        const data = await response.json();

        if (data.success) {
          setContributors(data.contributors);
        }
      } catch (error) {
        console.error('Error fetching top contributors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopContributors();
  }, []);

  // Don't render if no contributors or still loading
  if (loading || contributors.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Top Cooks</h2>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
        <p className="text-gray-700 mb-6 text-center">
          Our top contributors making the community delicious 🎉
        </p>

        <div className="space-y-4">
          {contributors.map((contributor, index) => (
            <div
              key={contributor.email}
              className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm"
            >
              {/* Rank Badge */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0
                    ? 'bg-yellow-500'
                    : index === 1
                    ? 'bg-gray-400'
                    : index === 2
                    ? 'bg-orange-600'
                    : 'bg-gray-300'
                }`}
              >
                {index + 1}
              </div>

              {/* Chef Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Name and Count */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{contributor.name}</p>
                <p className="text-sm text-gray-600">
                  {contributor.count} {contributor.count === 1 ? 'recipe' : 'recipes'}
                </p>
              </div>

              {/* Trophy for top 3 */}
              {index < 3 && <Trophy className="w-5 h-5 text-primary" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
