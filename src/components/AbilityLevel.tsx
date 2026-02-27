'use client';

import { useState } from 'react';

interface AbilityLevelProps {
  currentDifficulty: string;
  onChange?: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  readonly?: boolean;
}

export default function AbilityLevel({
  currentDifficulty,
  onChange,
  readonly = false,
}: AbilityLevelProps) {
  // Map recipe difficulty to ability level
  const getDifficultyLevel = (diff: string): 'beginner' | 'intermediate' | 'advanced' => {
    const lower = diff.toLowerCase();
    if (lower.includes('easy') || lower.includes('beginner') || lower.includes('simple')) {
      return 'beginner';
    }
    if (lower.includes('advanced') || lower.includes('hard') || lower.includes('challenging')) {
      return 'advanced';
    }
    return 'intermediate';
  };

  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    getDifficultyLevel(currentDifficulty)
  );

  const levels = [
    {
      value: 'beginner' as const,
      label: 'Beginner',
      description: 'New to cooking',
      color: 'bg-green-100 text-green-800 border-green-300',
      activeColor: 'bg-green-500 text-white border-green-600',
      icon: '🌱',
    },
    {
      value: 'intermediate' as const,
      label: 'Intermediate',
      description: 'Some experience',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      activeColor: 'bg-blue-500 text-white border-blue-600',
      icon: '👨‍🍳',
    },
    {
      value: 'advanced' as const,
      label: 'Advanced',
      description: 'Confident cook',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      activeColor: 'bg-purple-500 text-white border-purple-600',
      icon: '⭐',
    },
  ];

  const handleSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (readonly) return;
    setSelectedLevel(level);
    onChange?.(level);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {levels.map((level) => {
          const isActive = level.value === selectedLevel;
          const colorClass = isActive ? level.activeColor : level.color;

          return (
            <button
              key={level.value}
              onClick={() => handleSelect(level.value)}
              disabled={readonly}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${colorClass} ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-105'
              } ${isActive ? 'shadow-lg' : 'shadow-sm'}`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{level.icon}</span>
                <span className="font-bold text-lg">{level.label}</span>
              </div>
              <p className={`text-sm ${isActive ? 'opacity-90' : 'opacity-75'}`}>
                {level.description}
              </p>
            </button>
          );
        })}
      </div>

      {!readonly && (
        <p className="text-sm text-gray-600 text-center">
          This recipe is best suited for {selectedLevel} cooks
        </p>
      )}
    </div>
  );
}
