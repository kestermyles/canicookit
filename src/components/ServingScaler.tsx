'use client';

import { useState } from 'react';
import { scaleIngredient } from '@/utils/scaleIngredient';
import { convertIngredient } from '@/utils/convertMeasurements';
import MeasurementToggle, { useMeasurementPreference } from './MeasurementToggle';

interface ServingScalerProps {
  defaultServings: number;
  ingredients: string[];
}

export default function ServingScaler({ defaultServings, ingredients }: ServingScalerProps) {
  const [servings, setServings] = useState(defaultServings);
  const { isImperial } = useMeasurementPreference();
  const scaleFactor = servings / defaultServings;
  const min = 1;
  const max = defaultServings * 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-xl font-bold">Ingredients</h2>
        <div className="flex items-center gap-3">
          <MeasurementToggle />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-secondary mr-1">Serves</span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(min, s - 1))}
              disabled={servings <= min}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border border-orange-300 text-primary hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-foreground">{servings}</span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.min(max, s + 1))}
              disabled={servings >= max}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border border-orange-300 text-primary hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <ul className="space-y-2">
        {ingredients.map((ingredient, i) => {
          // Scale first, then convert units
          const scaled = scaleIngredient(ingredient, scaleFactor);
          const converted = isImperial ? convertIngredient(scaled, true) : scaled;
          return (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>{converted}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
