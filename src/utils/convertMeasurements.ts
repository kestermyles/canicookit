// --- Core conversions ---

export function gramsToOz(g: number): number {
  return Math.round(g * 0.035274 * 10) / 10;
}

export function mlToFlOz(ml: number): number {
  return Math.round(ml * 0.033814 * 10) / 10;
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

// --- Formatting helpers ---

const CUP_FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

function formatCups(ml: number): string {
  const cups = ml / 236.588;
  if (cups < 0.15) {
    // Too small for cups, use fl oz
    return `${mlToFlOz(ml)} fl oz`;
  }
  // Check for clean fractions
  const whole = Math.floor(cups);
  const frac = cups - whole;
  for (const [val, symbol] of CUP_FRACTIONS) {
    if (Math.abs(frac - val) < 0.08) {
      return whole > 0 ? `${whole}${symbol} cups` : `${symbol} cup`;
    }
  }
  if (Math.abs(frac) < 0.08) {
    return `${whole} cup${whole !== 1 ? 's' : ''}`;
  }
  // Fallback to fl oz for non-clean amounts
  return `${mlToFlOz(ml)} fl oz`;
}

function formatOz(g: number): string {
  const oz = gramsToOz(g);
  if (oz >= 16) {
    const lb = Math.round((oz / 16) * 10) / 10;
    if (lb % 1 === 0) return `${lb} lb`;
    return `${lb} lb`;
  }
  return `${oz} oz`;
}

// --- Main conversion function ---

// Matches: number (with optional decimal), optional range (dash + number), then unit
// e.g. "400g", "150-200g", "2.5kg", "250ml", "1l", "200°C"
const METRIC_PATTERN =
  /(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?)\s*)?(g|kg|ml|l|°C)\b/gi;

const IMPERIAL_PATTERN =
  /(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?)\s*)?(oz|lb|fl\s*oz|cups?|°F)\b/gi;

function convertSingleMetric(value: number, unit: string): string {
  switch (unit.toLowerCase()) {
    case 'g':
      return formatOz(value);
    case 'kg':
      return formatOz(value * 1000);
    case 'ml':
      return formatCups(value);
    case 'l':
      return formatCups(value * 1000);
    case '°c':
      return `${celsiusToFahrenheit(value)}°F`;
    default:
      return `${value}${unit}`;
  }
}

function convertSingleImperial(value: number, unit: string): string {
  const u = unit.toLowerCase().replace(/\s+/g, '');
  switch (u) {
    case 'oz':
      return `${Math.round(value * 28.3495 / 5) * 5}g`;
    case 'lb':
      return `${Math.round(value * 453.592 / 5) * 5}g`;
    case 'floz':
      return `${Math.round(value * 29.5735 / 5) * 5}ml`;
    case 'cup':
    case 'cups':
      return `${Math.round(value * 236.588 / 5) * 5}ml`;
    case '°f':
      return `${fahrenheitToCelsius(value)}°C`;
    default:
      return `${value} ${unit}`;
  }
}

export function convertIngredient(str: string, toImperial: boolean): string {
  if (toImperial) {
    return str.replace(METRIC_PATTERN, (_match, num1, num2, unit) => {
      const v1 = parseFloat(num1);
      const c1 = convertSingleMetric(v1, unit);
      if (num2) {
        const v2 = parseFloat(num2);
        const c2 = convertSingleMetric(v2, unit);
        // Extract just the number from c2 (unit is already in c1)
        return `${c1.split(' ')[0]}-${c2}`;
      }
      return c1;
    });
  } else {
    return str.replace(IMPERIAL_PATTERN, (_match, num1, num2, unit) => {
      const v1 = parseFloat(num1);
      const c1 = convertSingleImperial(v1, unit);
      if (num2) {
        const v2 = parseFloat(num2);
        const c2 = convertSingleImperial(v2, unit);
        return `${c1.split(' ')[0]}-${c2}`;
      }
      return c1;
    });
  }
}

/**
 * Convert temperatures in HTML content (for method sections).
 * Only converts °C ↔ °F patterns.
 */
export function convertTemperaturesInHtml(html: string, toImperial: boolean): string {
  if (toImperial) {
    return html.replace(/(\d+)\s*°C/g, (_m, num) => {
      return `${celsiusToFahrenheit(parseInt(num))}°F`;
    });
  } else {
    return html.replace(/(\d+)\s*°F/g, (_m, num) => {
      return `${fahrenheitToCelsius(parseInt(num))}°C`;
    });
  }
}
