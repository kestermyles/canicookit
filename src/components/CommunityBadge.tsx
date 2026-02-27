import React from 'react';

interface CommunityBadgeProps {
  status?: 'pending' | 'featured' | 'rejected';
  qualityScore?: number;
  className?: string;
}

export default function CommunityBadge({
  status = 'pending',
  qualityScore,
  className = '',
}: CommunityBadgeProps) {
  // Different styles based on status
  const badgeStyles = {
    featured:
      'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600',
    pending: 'bg-blue-100 text-blue-800 border-blue-300',
    rejected: 'bg-gray-100 text-gray-600 border-gray-300',
  };

  const badgeText = {
    featured: '⭐ Featured Community Recipe',
    pending: '🌱 New Community Recipe',
    rejected: 'Community Recipe',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${badgeStyles[status]} ${className}`}
    >
      <span>{badgeText[status]}</span>
      {qualityScore && status === 'featured' && (
        <span className="text-xs font-normal opacity-90">
          (Score: {qualityScore.toFixed(1)}/10)
        </span>
      )}
    </div>
  );
}
