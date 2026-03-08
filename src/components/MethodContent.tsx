'use client';

import { useMeasurementPreference } from './MeasurementToggle';
import { convertTemperaturesInHtml } from '@/utils/convertMeasurements';

interface MethodContentProps {
  html: string;
}

export default function MethodContent({ html }: MethodContentProps) {
  const { isImperial } = useMeasurementPreference();
  const converted = isImperial ? convertTemperaturesInHtml(html, true) : html;

  return (
    <div
      className="recipe-content"
      dangerouslySetInnerHTML={{ __html: converted }}
    />
  );
}
