import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { EMPTY_INPUT, type DiscoveryInput, type Recommendation } from '../lib/recommend/types';
import type { FeedbackValue } from '../lib/storage';
import { loadState } from '../lib/storage';

export interface QuickSelection {
  unitId?: string;
  topicId?: string;
}

export interface AppState {
  quick: QuickSelection;
  input: DiscoveryInput;
  results: Recommendation[] | null;
  aiUsed: boolean;
  chosen: string[];
  feedback: Record<string, FeedbackValue>;
  saved: boolean;
}

type Action =
  | { type: 'setQuick'; quick: QuickSelection }
  | { type: 'setInput'; input: DiscoveryInput }
  | { type: 'setResults'; results: Recommendation[]; aiUsed?: boolean }
  | { type: 'toggleChosen'; id: string }
  | { type: 'setFeedback'; id: string; value: FeedbackValue }
  | { type: 'markSaved'; saved: boolean }
  | { type: 'reset' };

function initial(): AppState {
  const saved = loadState();
  return {
    quick: saved?.quick ?? {},
    input: saved?.input ?? EMPTY_INPUT,
    results: null,
    aiUsed: false,
    chosen: saved?.chosen ?? [],
    feedback: saved?.feedback ?? {},
    saved: saved !== null,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setQuick':
      return { ...state, quick: action.quick };
    case 'setInput':
      return { ...state, input: action.input, results: null };
    case 'setResults':
      return {
        ...state,
        results: action.results,
        aiUsed: action.aiUsed ?? false,
        chosen: action.results.map((r) => r.scenario.id),
      };
    case 'toggleChosen':
      return {
        ...state,
        chosen: state.chosen.includes(action.id)
          ? state.chosen.filter((x) => x !== action.id)
          : [...state.chosen, action.id],
      };
    case 'setFeedback':
      return { ...state, feedback: { ...state.feedback, [action.id]: action.value } };
    case 'markSaved':
      return { ...state, saved: action.saved };
    case 'reset':
      return {
        quick: {},
        input: EMPTY_INPUT,
        results: null,
        aiUsed: false,
        chosen: [],
        feedback: {},
        saved: false,
      };
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState outside provider');
  return v;
}
