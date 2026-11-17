import { describe, expect, it } from 'vitest';
import { hebrewVariants, normalizeHebrew, tokenize } from '../../src/lib/hebrew';

describe('normalizeHebrew', () => {
  it('removes niqqud and cantillation', () => {
    expect(normalizeHebrew('שָׁלוֹם')).toBe('שלומ');
  });
  it('unifies final letters', () => {
    expect(normalizeHebrew('ךםןףץ')).toBe('כמנפצ');
  });
  it('unifies geresh and gershayim', () => {
    expect(normalizeHebrew('צ׳ק ת״ז’')).toBe(`צ'ק ת"ז'`);
  });
  it('lower-cases Latin', () => {
    expect(normalizeHebrew('Gemini NotebookLM')).toBe('gemini notebooklm');
  });
});

describe('tokenize', () => {
  it('splits on non letters/digits and drops quote marks inside words', () => {
    expect(tokenize('שו"ת, נהלים; Gemini-2')).toEqual(['שות', 'נהלימ', 'gemini', '2']);
  });
});

describe('hebrewVariants', () => {
  it('strips one or two prefix letters when at least 3 letters remain', () => {
    const v = hebrewVariants(normalizeHebrew('ובנהלים'));
    expect(v).toContain('בנהלימ');
    expect(v).toContain('נהלימ');
    expect(v).toContain('נהל');
  });
  it('keeps short words intact', () => {
    expect(hebrewVariants('של')).toEqual(['של']);
  });
  it('strips plural suffix ות', () => {
    expect(hebrewVariants('ישיבות')).toContain('ישיב');
  });
  it('leaves Latin words alone', () => {
    expect(hebrewVariants('gemini')).toEqual(['gemini']);
  });
});
