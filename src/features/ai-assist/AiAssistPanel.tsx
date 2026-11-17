import { useState } from 'react';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { t } from '../../lib/content';
import type { DiscoveryInput, Recommendation } from '../../lib/recommend/types';
import { labeler, ruleRecommender } from '../../app/recommender';

interface Props {
  input: DiscoveryInput;
  onResults: (results: Recommendation[], usedAi: boolean, fallbackNotice: boolean) => void;
}

/** Opt-in panel. Rendered only when the build flag is on; code and Firebase load after consent. */
export function AiAssistPanel({ input, onResults }: Props) {
  const [stage, setStage] = useState<'idle' | 'disclose' | 'loading'>('idle');
  return (
    <section className="ai-panel" aria-labelledby="ai-title">
      <h2 id="ai-title">הכוונה חכמה (ניסיוני)</h2>
      {stage === 'idle' && (
        <button type="button" className="button" onClick={() => setStage('disclose')}>
          הפעלת הכוונה חכמה
        </button>
      )}
      {stage === 'disclose' && (
        <div>
          <OrgDataNotice variant="inline" extra={t('ai.disclosure')} />
          <p>יישלחו רק מזהי הבחירות שסימנתם ותוויותיהן, ורשימה סגורה של עד 8 שימושים מהקטלוג.</p>
          <div className="cta-row">
            <button
              type="button"
              className="button button-primary"
              onClick={async () => {
                setStage('loading');
                try {
                  const [{ createGenerate }, { GeminiAssistRecommender }] = await Promise.all([
                    import('./gemini-assist'),
                    import('./assist-recommender'),
                  ]);
                  const rec = new GeminiAssistRecommender({
                    generate: createGenerate(),
                    rules: ruleRecommender,
                    label: (c, id) => labeler(c as never, id),
                    session: window.sessionStorage,
                  });
                  const out = await rec.run(input);
                  onResults(out.recommendations, out.usedAi, out.fallbackNotice);
                } catch {
                  onResults(await ruleRecommender.recommend(input), false, true);
                }
                setStage('idle');
              }}
            >
              אני מבין/ה, הפעילו
            </button>
            <button type="button" className="button" onClick={() => setStage('idle')}>
              ביטול
            </button>
          </div>
        </div>
      )}
      {stage === 'loading' && <p aria-live="polite">מנסח נימוקים…</p>}
    </section>
  );
}
