'use client';

import { MeasurementProvider } from './MeasurementToggle';
import ServingScaler from './ServingScaler';
import MethodContent from './MethodContent';

interface RecipeBodyProps {
  defaultServings: number;
  ingredients: string[];
  methodHtml: string;
}

export default function RecipeBody({ defaultServings, ingredients, methodHtml }: RecipeBodyProps) {
  return (
    <MeasurementProvider>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
        {/* Ingredients */}
        <div>
          <ServingScaler defaultServings={defaultServings} ingredients={ingredients} />
        </div>

        {/* Method */}
        <div>
          <MethodContent html={methodHtml} />
        </div>
      </div>
    </MeasurementProvider>
  );
}
