/**
 * Firebase AI Logic client. Loaded ONLY via dynamic import, ONLY when VITE_ENABLE_AI_ASSIST=true
 * and ONLY after the user opted in. See docs/DECISIONS.md and docs/HUMAN_CHECKLIST.md before enabling.
 */
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import type { AssistRequest, Generate } from './assist-recommender';
import { SYSTEM_INSTRUCTION } from './assist-recommender';

const responseSchema = Schema.object({
  properties: {
    recommendations: Schema.array({
      items: Schema.object({
        properties: { scenarioId: Schema.string(), reason: Schema.string() },
      }),
    }),
  },
});

export function createGenerate(): Generate {
  const env = import.meta.env;
  const model = env.VITE_GEMINI_MODEL;
  if (!model) throw new Error('VITE_GEMINI_MODEL is not configured');
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  if (import.meta.env.DEV) {
    // Debug token only in local development; never shipped in production builds.
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  // App Check must be initialized before any other Firebase service.
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY ?? ''),
    isTokenAutoRefreshEnabled: true,
  });
  const ai = getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true });
  const gm = getGenerativeModel(ai, {
    model,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: { responseMimeType: 'application/json', responseSchema },
  });
  return async (req: AssistRequest) => {
    const prompt = [
      'בחירות המשתמש (מזהה ותווית):',
      JSON.stringify(req.selections),
      'מועמדים (רשימה סגורה):',
      JSON.stringify(req.candidates),
      'בחר עד 3 מועמדים מתאימים ביותר ונסח לכל אחד נימוק קצר בעברית (עד 200 תווים, ללא אחוזים).',
    ].join('\n');
    const result = await gm.generateContent(prompt);
    return result.response.text();
  };
}
