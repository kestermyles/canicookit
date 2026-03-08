'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface MeasurementContextType {
  isImperial: boolean;
  toggle: () => void;
}

const MeasurementContext = createContext<MeasurementContextType>({
  isImperial: false,
  toggle: () => {},
});

export function useMeasurementPreference() {
  return useContext(MeasurementContext);
}

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [isImperial, setIsImperial] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('measurementPreference');
      if (stored === 'imperial') setIsImperial(true);
    } catch {
      // ignore
    }
  }, []);

  const toggle = () => {
    setIsImperial((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('measurementPreference', next ? 'imperial' : 'metric');
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <MeasurementContext.Provider value={{ isImperial, toggle }}>
      {children}
    </MeasurementContext.Provider>
  );
}

export default function MeasurementToggle() {
  const { isImperial, toggle } = useMeasurementPreference();

  return (
    <div className="inline-flex rounded-full border border-gray-200 overflow-hidden text-xs">
      <button
        type="button"
        onClick={!isImperial ? undefined : toggle}
        className={`px-2.5 py-1 font-medium transition-colors ${
          !isImperial
            ? 'bg-primary text-white'
            : 'bg-white text-gray-500 hover:text-gray-700'
        }`}
      >
        Metric
      </button>
      <button
        type="button"
        onClick={isImperial ? undefined : toggle}
        className={`px-2.5 py-1 font-medium transition-colors ${
          isImperial
            ? 'bg-primary text-white'
            : 'bg-white text-gray-500 hover:text-gray-700'
        }`}
      >
        Imperial
      </button>
    </div>
  );
}
