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

// Items that should always round to whole numbers when scaling
const COUNTABLE_KEYWORDS = [
  'egg', 'eggs',
  'onion', 'onions',
  'clove', 'cloves',
  'slice', 'slices',
  'sprig', 'sprigs',
  'leaf', 'leaves',
  'rasher', 'rashers',
  'sausage', 'sausages',
  'sheet', 'sheets',
  'pepper', 'peppers',
  'tomato', 'tomatoes',
  'potato', 'potatoes',
  'banana', 'bananas',
  'apple', 'apples',
  'lemon', 'lemons',
  'lime', 'limes',
  'orange', 'oranges',
  'avocado', 'avocados',
  'carrot', 'carrots',
  'courgette', 'courgettes',
  'aubergine', 'aubergines',
  'chicken breast', 'chicken breasts',
  'fillet', 'fillets',
  'steak', 'steaks',
  'chop', 'chops',
];

function isCountable(rest: string): boolean {
  const trimmed = rest.trim().toLowerCase();
  return COUNTABLE_KEYWORDS.some((kw) => trimmed.startsWith(kw));
}

function formatNumber(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;

  if (frac > 0.01) {
    for (const [val, symbol] of NUMBER_TO_FRACTION) {
      if (Math.abs(frac - val) < 0.05) {
        return whole > 0 ? `${whole}${symbol}` : symbol;
      }
    }
  }

  if (Math.abs(n - Math.round(n)) < 0.05) {
    return String(Math.round(n));
  }

  if (n < 10) {
    const rounded = Math.round(n * 10) / 10;
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  }

  return String(Math.round(n));
}

// Pattern: optional whole number, optional vulgar fraction, optional slash fraction (1/2)
const LEADING_NUMBER_RE =
  /^(\d+)?\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅛])?(?:(\d+)\/(\d+))?\s*/;

function parseLeadingNumber(s: string): { value: number; length: number } | null {
  const match = s.match(LEADING_NUMBER_RE);
  if (!match) return null;
  const [fullMatch, wholeStr, vulgar, numer, denom] = match;
  if (!wholeStr && !vulgar && !numer) return null;
  let value = 0;
  if (wholeStr) value += parseFloat(wholeStr);
  if (vulgar) value += VULGAR_FRACTIONS[vulgar] || 0;
  if (numer && denom) value += parseInt(numer) / parseInt(denom);
  return { value, length: fullMatch.length };
}

function formatScaled(n: number, rest: string): string {
  if (isCountable(rest)) return String(Math.round(n));
  return formatNumber(n);
}

export function scaleIngredient(raw: string, scaleFactor: number): string {
  if (scaleFactor === 1) return raw;

  const first = parseLeadingNumber(raw);
  if (!first) return raw;

  // Check for range separator (en-dash or hyphen) after the first number
  const afterFirst = raw.slice(first.length);
  const rangeMatch = afterFirst.match(/^[–-]\s*/);

  if (rangeMatch) {
    const secondStart = first.length + rangeMatch[0].length;
    const second = parseLeadingNumber(raw.slice(secondStart));
    if (second) {
      const rest = raw.slice(secondStart + second.length);
      const s1 = first.value * scaleFactor;
      const s2 = second.value * scaleFactor;
      const f1 = formatScaled(s1, rest);
      const f2 = formatScaled(s2, rest);
      const restStr = rest.startsWith(' ') ? rest : ' ' + rest;
      return `${f1}–${f2}${restStr}`.replace(/ {2,}/g, ' ');
    }
  }

  // Single number
  const scaled = first.value * scaleFactor;
  const rest = raw.slice(first.length);
  const formatted = formatScaled(scaled, rest);
  return formatted + (rest.startsWith(' ') ? rest : ' ' + rest).replace(/^ {2,}/, ' ');
}
