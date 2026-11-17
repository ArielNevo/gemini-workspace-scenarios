/** Hebrew-aware text normalization for client-side search (section 9.2 of the brief). */

const NIQQUD = /[֑-ׇ]/g;
const GERESH = /[׳’‘`´]/g; // ׳ ’ ‘ → '
const GERSHAYIM = /[״“”]/g; // ״ ” “ → "
const FINALS: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };
const PREFIX_LETTERS = new Set(['ה', 'ו', 'ב', 'כ', 'ל', 'מ', 'ש']);
const HEBREW_WORD = /^[א-ת]+$/;
const MIN_STEM = 3;

export function normalizeHebrew(text: string): string {
  return text
    .normalize('NFC')
    .replace(NIQQUD, '')
    .replace(GERESH, "'")
    .replace(GERSHAYIM, '"')
    .replace(/[ךםןףץ]/g, (c) => FINALS[c] ?? c)
    .toLowerCase();
}

/** Split normalized text into words on anything that is not a letter or digit. Quote marks inside words (e.g. שו"ת) are dropped. */
export function tokenize(text: string): string[] {
  return normalizeHebrew(text)
    .replace(/['"]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function stripSuffix(word: string): string | null {
  if ((word.endsWith('ימ') || word.endsWith('ות')) && word.length - 2 >= MIN_STEM) return word.slice(0, -2);
  return null;
}

/** Surface variants of a normalized word: itself, without 1–2 prefix letters, without plural suffixes. */
export function hebrewVariants(word: string): string[] {
  const out = new Set<string>([word]);
  if (!HEBREW_WORD.test(word)) return [...out];
  const bases = [word];
  if (word.length - 1 >= MIN_STEM && PREFIX_LETTERS.has(word[0]!)) {
    bases.push(word.slice(1));
    if (word.length - 2 >= MIN_STEM && PREFIX_LETTERS.has(word[1]!)) bases.push(word.slice(2));
  }
  for (const b of bases) {
    out.add(b);
    const s = stripSuffix(b);
    if (s) out.add(s);
  }
  return [...out];
}

export const STOPWORDS = new Set(
  [
    'את',
    'של',
    'על',
    'עם',
    'או',
    'גם',
    'כי',
    'אני',
    'זה',
    'זו',
    'לי',
    'יש',
    'מה',
    'אם',
    'כל',
    'רק',
    'אל',
    'לא',
  ].map(normalizeHebrew),
);
