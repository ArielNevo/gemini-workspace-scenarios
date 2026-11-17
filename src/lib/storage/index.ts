import type { DiscoveryInput } from '../recommend/types';

/** Versioned key. Data is written ONLY when the user presses "save". */
export const STORAGE_KEY = 'gemini-discovery:v1';

export interface SavedState {
  version: 1;
  savedOn: string;
  input: DiscoveryInput;
  chosen: string[];
  feedback: Record<string, FeedbackValue>;
}
export type FeedbackValue = 'relevant' | 'not-like-my-work' | 'show-other';

function store(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function saveState(state: Omit<SavedState, 'version' | 'savedOn'>, today = new Date()): boolean {
  const s = store();
  if (!s) return false;
  try {
    const payload: SavedState = { version: 1, savedOn: today.toISOString().slice(0, 10), ...state };
    s.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadState(): SavedState | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearState(): void {
  const s = store();
  try {
    s?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSavedState(): boolean {
  return loadState() !== null;
}
