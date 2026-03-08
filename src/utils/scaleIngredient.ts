const VULGAR_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1 / 6,
  '⅛': 0.125,
};

const NUMBER_TO_FRACTION: [number, string][] = [
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

function formatNumber(n: number): string {
  // Check if the fractional part matches a vulgar fraction
  const whole = Math.floor(n);
  const frac = n - whole;

  if (frac > 0.01) {
    for (const [val, symbol] of NUMBER_TO_FRACTION) {
      if (Math.abs(frac - val) < 0.05) {
        return whole > 0 ? `${whole}${symbol}` : symbol;
      }
    }
  }

  // Whole number
  if (Math.abs(n - Math.round(n)) < 0.05) {
    return String(Math.round(n));
  }

  // Under 10: 1 decimal place max
  if (n < 10) {
    const rounded = Math.round(n * 10) / 10;
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  }

  // 10+: round to nearest whole
  return String(Math.round(n));
}

// Pattern: optional whole number, optional vulgar fraction, optional slash fraction (1/2)
const LEADING_NUMBER_RE =
  /^(\d+)?\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅛])?(?:(\d+)\/(\d+))?\s*/;

export function scaleIngredient(raw: string, scaleFactor: number): string {
  if (scaleFactor === 1) return raw;

  const match = raw.match(LEADING_NUMBER_RE);
  if (!match) return raw;

  const [fullMatch, wholeStr, vulgar, numerator, denominator] = match;

  // Must have at least one numeric part
  if (!wholeStr && !vulgar && !numerator) return raw;

  let value = 0;

  if (wholeStr) value += parseFloat(wholeStr);
  if (vulgar) value += VULGAR_FRACTIONS[vulgar] || 0;
  if (numerator && denominator) value += parseInt(numerator) / parseInt(denominator);

  const scaled = value * scaleFactor;
  const rest = raw.slice(fullMatch.length);

  return formatNumber(scaled) + (rest.startsWith(' ') ? rest : ' ' + rest).replace(/^ {2,}/, ' ');
}
