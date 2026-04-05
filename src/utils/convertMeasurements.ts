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

// --- Liquid/dairy detection ---

// Ingredients where grams should convert to cups (density ≈ 1g/ml)
const LIQUID_DAIRY_KEYWORDS = [
  'cream', 'milk', 'yogurt', 'yoghurt', 'buttermilk',
  'sour cream', 'crème fraîche', 'creme fraiche',
  'water', 'stock', 'broth', 'juice', 'wine',
  'sauce', 'vinegar', 'honey', 'syrup', 'oil',
  'coconut milk', 'coconut cream', 'passata',
  'kefir', 'ricotta', 'mascarpone',
];

function isLiquidDairy(ingredientContext: string): boolean {
  const lower = ingredientContext.toLowerCase();
  return LIQUID_DAIRY_KEYWORDS.some((kw) => lower.includes(kw));
}

function isFlour(context: string): boolean {
  return context.toLowerCase().includes('flour');
}

function isButter(context: string): boolean {
  const lower = context.toLowerCase();
  return lower.includes('butter') &&
    !lower.includes('buttermilk') &&
    !lower.includes('peanut butter');
}

function isSugarOrSweetener(context: string): boolean {
  const lower = context.toLowerCase();
  const keywords = [
    'sugar', 'caster', 'icing', 'powdered', 'brown sugar',
    'demerara', 'muscovado', 'golden caster',
  ];
  return keywords.some((kw) => lower.includes(kw));
}

function formatSugarCups(grams: number): string {
  // 1 cup granulated/caster sugar = 200g; icing/powdered = 120g
  // Use 200g as default (most recipes use granulated/caster)
  const cups = grams / 200;
  const whole = Math.floor(cups);
  const frac = cups - whole;

  const CUP_MAP: [number, string][] = [
    [0.25, '¼'], [1/3, '⅓'], [0.5, '½'], [2/3, '⅔'], [0.75, '¾'],
  ];

  let fracSymbol: string | null = null;
  for (const [val, sym] of CUP_MAP) {
    if (Math.abs(frac - val) < 0.08) { fracSymbol = sym; break; }
  }

  if (Math.abs(frac) < 0.08 && whole > 0) {
    return `${whole} cup${whole !== 1 ? 's' : ''}`;
  }
  if (fracSymbol) {
    return whole > 0 ? `${whole}${fracSymbol} cups` : `${fracSymbol} cup`;
  }
  // No clean cup match — fall back to oz
  return formatOz(grams);
}

// --- Formatting helpers ---

// Small volume shortcuts (tbsp / tsp)
const SMALL_VOLUMES: [number, string][] = [
  [5, '1 tsp'],
  [10, '2 tsp'],
  [15, '1 tbsp'],
  [30, '2 tbsp'],
  [45, '3 tbsp'],
];

// Cup fractions for matching
const CUP_FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

function formatVolume(ml: number): string {
  // Very small amounts → tsp/tbsp
  for (const [threshold, label] of SMALL_VOLUMES) {
    if (Math.abs(ml - threshold) < 3) return label;
  }

  // Try cups
  const cups = ml / 236.588;
  const whole = Math.floor(cups);
  const frac = cups - whole;

  // Check for clean fraction match
  let cleanCup: string | null = null;

  if (Math.abs(frac) < 0.08 && whole > 0) {
    cleanCup = `${whole} cup${whole !== 1 ? 's' : ''}`;
  } else {
    for (const [val, symbol] of CUP_FRACTIONS) {
      if (Math.abs(frac - val) < 0.08) {
        cleanCup = whole > 0 ? `${whole}${symbol} cups` : `${symbol} cup`;
        break;
      }
    }
  }

  // Large volumes (500ml+): show cups with fl oz in parentheses
  if (ml >= 500 && cleanCup) {
    return `${cleanCup} (${mlToFlOz(ml)} fl oz)`;
  }

  // Clean cup fraction: cups only
  if (cleanCup) {
    return cleanCup;
  }

  // No clean cup match: fl oz
  return `${mlToFlOz(ml)} fl oz`;
}

function formatOz(g: number): string {
  const oz = gramsToOz(g);
  if (oz >= 16) {
    const lb = Math.round((oz / 16) * 10) / 10;
    return `${lb} lb`;
  }
  return `${oz} oz`;
}

// Flour: 1 cup = 4.25 oz by weight, round to nearest ¼ cup
function formatFlourCups(grams: number): string {
  const oz = gramsToOz(grams);
  const cups = Math.round((oz / 4.25) * 4) / 4;
  const whole = Math.floor(cups);
  const frac = cups - whole;

  const fracSymbol =
    Math.abs(frac - 0.25) < 0.01 ? '¼' :
    Math.abs(frac - 0.5) < 0.01 ? '½' :
    Math.abs(frac - 0.75) < 0.01 ? '¾' : null;

  if (fracSymbol) {
    return whole > 0 ? `${whole}${fracSymbol} cups` : `${fracSymbol} cup`;
  }
  if (whole > 0) return `${whole} cup${whole !== 1 ? 's' : ''}`;
  return formatOz(grams);
}

// Butter: under 4 oz → tbsp (1 oz = 2 tbsp), 4 oz+ → cups (1 cup = 8 oz)
function formatButterVolume(grams: number): string {
  const oz = gramsToOz(grams);
  if (oz < 4) {
    const tbsp = Math.round(oz * 2);
    return `${tbsp} tbsp`;
  }
  const cups = Math.round((oz / 8) * 4) / 4;
  const whole = Math.floor(cups);
  const frac = cups - whole;

  const fracSymbol =
    Math.abs(frac - 0.25) < 0.01 ? '¼' :
    Math.abs(frac - 0.5) < 0.01 ? '½' :
    Math.abs(frac - 0.75) < 0.01 ? '¾' : null;

  if (fracSymbol) {
    return whole > 0 ? `${whole}${fracSymbol} cups` : `${fracSymbol} cup`;
  }
  if (whole > 0) return `${whole} cup${whole !== 1 ? 's' : ''}`;
  return formatOz(grams);
}

// --- Vulgar fraction parsing (for scaled numbers like 562½) ---

const VULGAR_VALUES: Record<string, number> = {
  '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 1 / 6, '⅛': 0.125,
};

// --- Main conversion function ---

// Matches: number (with optional decimal/vulgar fraction), optional range, then unit
// e.g. "400g", "150-200g", "562½g", "2.5kg", "250ml", "200°C"
const VF = '[½⅓⅔¼¾⅕⅖⅗⅘⅙⅛]';
const METRIC_PATTERN = new RegExp(
  `(\\d+(?:\\.\\d+)?)(${VF})?\\s*(?:[–-]\\s*(\\d+(?:\\.\\d+)?)(${VF})?\\s*)?(g|kg|ml|l|°C)\\b`,
  'gi'
);

const IMPERIAL_PATTERN = new RegExp(
  `(\\d+(?:\\.\\d+)?)(${VF})?\\s*(?:[–-]\\s*(\\d+(?:\\.\\d+)?)(${VF})?\\s*)?(oz|lb|fl\\s*oz|cups?|°F)\\b`,
  'gi'
);

function convertSingleMetric(
  value: number,
  unit: string,
  context: string
): string {
  switch (unit.toLowerCase()) {
    case 'g':
      if (isFlour(context)) return formatFlourCups(value);
      if (isButter(context)) return formatButterVolume(value);
      if (isSugarOrSweetener(context)) return formatSugarCups(value);
      if (isLiquidDairy(context)) return formatVolume(value);
      return formatOz(value);
    case 'kg':
      if (isFlour(context)) return formatFlourCups(value * 1000);
      if (isButter(context)) return formatButterVolume(value * 1000);
      if (isSugarOrSweetener(context)) return formatSugarCups(value * 1000);
      if (isLiquidDairy(context)) return formatVolume(value * 1000);
      return formatOz(value * 1000);
    case 'ml':
      return formatVolume(value);
    case 'l':
      return formatVolume(value * 1000);
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
      return `${Math.round((value * 28.3495) / 5) * 5}g`;
    case 'lb':
      return `${Math.round((value * 453.592) / 5) * 5}g`;
    case 'floz':
      return `${Math.round((value * 29.5735) / 5) * 5}ml`;
    case 'cup':
    case 'cups':
      return `${Math.round((value * 236.588) / 5) * 5}ml`;
    case '°f':
      return `${fahrenheitToCelsius(value)}°C`;
    default:
      return `${value} ${unit}`;
  }
}

export function convertIngredient(str: string, toImperial: boolean): string {
  if (toImperial) {
    return str.replace(METRIC_PATTERN, (_match, num1, vf1, num2, vf2, unit) => {
      const v1 = parseFloat(num1) + (vf1 ? (VULGAR_VALUES[vf1] || 0) : 0);
      const c1 = convertSingleMetric(v1, unit, str);
      if (num2) {
        const v2 = parseFloat(num2) + (vf2 ? (VULGAR_VALUES[vf2] || 0) : 0);
        const c2 = convertSingleMetric(v2, unit, str);
        return `${c1.split(' ')[0]}–${c2}`;
      }
      return c1;
    });
  } else {
    return str.replace(IMPERIAL_PATTERN, (_match, num1, vf1, num2, vf2, unit) => {
      const v1 = parseFloat(num1) + (vf1 ? (VULGAR_VALUES[vf1] || 0) : 0);
      const c1 = convertSingleImperial(v1, unit);
      if (num2) {
        const v2 = parseFloat(num2) + (vf2 ? (VULGAR_VALUES[vf2] || 0) : 0);
        const c2 = convertSingleImperial(v2, unit);
        return `${c1.split(' ')[0]}–${c2}`;
      }
      return c1;
    });
  }
}

/**
 * Convert temperatures in HTML content (for method sections).
 * Only converts °C ↔ °F patterns.
 */
export function convertTemperaturesInHtml(
  html: string,
  toImperial: boolean
): string {
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
