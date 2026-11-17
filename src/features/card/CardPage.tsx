import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { ToolName } from '../../components/Badges';
import { getScenario, siteConfig, t, tagLabel, TOOL_SHORT } from '../../lib/content';
import { useAppState } from '../../app/state';
import { buildAccessRequest, type AccessPayload } from '../../lib/access-request';
import { clearState, saveState } from '../../lib/storage';
import { SCORED_CATEGORIES } from '../../lib/recommend/types';
import { ExternalLink } from '../../components/ExternalLink';
import { TimeCalculator } from './TimeCalculator';

const CATEGORY_LABEL: Record<string, string> = {
  tasks: 'משימות',
  difficulties: 'קשיים',
  materials: 'חומר',
  outputs: 'תוצר רצוי',
  roles: 'תחום פעילות',
  frequency: 'תדירות',
};

export default function CardPage() {
  const { state, dispatch } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');
  const chosen = state.chosen.map(getScenario).filter((s) => s !== undefined);
  const reasons = new Map((state.results ?? []).map((r) => [r.scenario.id, r.reason]));
  const caution = state.input.materialClass === 'internal' || state.input.materialClass === 'protected';

  const payload: AccessPayload = useMemo(
    () => ({
      scenarios: chosen.map((s) => ({ id: s.id, title: s.title })),
      tags: SCORED_CATEGORIES.map((cat) => ({
        category: CATEGORY_LABEL[cat]!,
        labels: state.input[cat].map((id) => tagLabel(cat, id)),
      })),
      date: new Date().toISOString().slice(0, 10),
    }),
    [chosen, state.input],
  );
  const request = buildAccessRequest(siteConfig.requestAccess, payload);

  const plainText = () =>
    [
      'השימושים שלי: Gemini ו-Gemini Notebook',
      '',
      ...chosen.flatMap((s) => [
        `• ${s.title} (${TOOL_SHORT[s.tool]})`,
        reasons.get(s.id) ? `  למה: ${reasons.get(s.id)}` : '',
        `  במה להתנסות: ${s.firstExperiment.materialSuggestion}`,
        ...s.firstExperiment.steps.map((x, i) => `  ${i + 1}. ${x}`),
        `  הצלחה: ${s.firstExperiment.successCriteria.join('; ')}`,
        '',
      ]),
      caution ? t('notice.cautionInternal') : '',
      t('notice.afterLicense'),
    ]
      .filter((l) => l !== '')
      .join('\n');

  if (chosen.length === 0) {
    return (
      <Page title="השימושים שלי">
        <OrgDataNotice variant="inline" />
        <p>עדיין לא נבחרו שימושים.</p>
        <div className="cta-row">
          <Link to="/start" className="button button-primary">
            ענו על השאלות הקצרות
          </Link>
          <Link to="/catalog" className="button">
            לקטלוג
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page title="השימושים שלי" className="card-page">
      <OrgDataNotice variant="inline" message="inline" />
      <OrgDataNotice variant="inline" message="afterLicense" />
      {caution && <p className="notice-soft">{t('notice.cautionInternal')}</p>}
      <ol className="personal-card">
        {chosen.map((s) => (
          <li key={s.id} className="card">
            <h2>{s.title}</h2>
            <p className="small">
              כלי: <ToolName tool={s.tool} />
            </p>
            {reasons.get(s.id) && (
              <p>
                <strong>למה זה רלוונטי: </strong>
                {reasons.get(s.id)}
              </p>
            )}
            <p>
              <strong>מה להכין: </strong>
              {s.firstExperiment.materialSuggestion}
            </p>
            <p>
              <strong>במה להתחיל:</strong>
            </p>
            <ol>
              {s.firstExperiment.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p>
              <strong>מה נחשב הצלחה: </strong>
              {s.firstExperiment.successCriteria.join(' · ')}
            </p>
            <button
              type="button"
              className="link-button no-print"
              onClick={() => dispatch({ type: 'toggleChosen', id: s.id })}
            >
              הסירו מהכרטיס<span className="visually-hidden">: {s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="no-print" aria-labelledby="req-h">
        <h2 id="req-h">הדרך לבקש גישה</h2>
        {request.mode === 'none' ? (
          <>
            <p>
              <strong>{t('request.none')}</strong>
            </p>
            <p>{t('request.noneHint')}</p>
          </>
        ) : !confirming ? (
          <button type="button" className="button button-primary" onClick={() => setConfirming(true)}>
            אני רוצה להתנסות
          </button>
        ) : (
          <div className="confirm-box" role="region" aria-labelledby="confirm-h">
            <h3 id="confirm-h">זה מה שיועבר</h3>
            <p>יישלחו רק: השימושים שבחרת, התגיות שבחרת ותאריך. אין העברה אוטומטית.</p>
            <pre className="payload" data-testid="request-payload">
              {request.text}
            </pre>
            <div className="cta-row">
              <a
                className="button button-primary"
                href={request.href}
                data-testid="request-confirm"
                {...(request.mode === 'url' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {request.mode === 'url' ? 'אישור ומעבר לטופס' : 'אישור ופתיחת הודעת מייל'}
              </a>
              <button type="button" className="button" onClick={() => setConfirming(false)}>
                ביטול
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="cta-row no-print">
        <button
          type="button"
          className="button"
          onClick={() => {
            const ok = saveState({ input: state.input, chosen: state.chosen, feedback: state.feedback });
            dispatch({ type: 'markSaved', saved: ok });
            setStatus(ok ? 'המסלול נשמר בדפדפן הזה בלבד.' : 'לא ניתן לשמור בדפדפן הזה.');
          }}
        >
          שמור לי את המסלול
        </button>
        <button type="button" className="button" onClick={() => window.print()}>
          הדפס או שמור כ-PDF
        </button>
        <button
          type="button"
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(plainText());
              setStatus('הטקסט הועתק.');
            } catch {
              setStatus('לא ניתן להעתיק אוטומטית. אפשר להדפיס או לסמן ולהעתיק ידנית.');
            }
          }}
        >
          העתק כטקסט
        </button>
        <Link to="/start" className="button">
          מצא שימוש אחר
        </Link>
        {state.saved && (
          <button
            type="button"
            className="button button-danger"
            onClick={() => {
              clearState();
              dispatch({ type: 'markSaved', saved: false });
              setStatus('הנתונים השמורים נמחקו.');
            }}
          >
            מחק את הנתונים שלי
          </button>
        )}
      </div>
      <p role="status" className="small">
        {status}
      </p>

      {siteConfig.feedbackUrl && (
        <p className="no-print">
          <ExternalLink href={siteConfig.feedbackUrl}>שלחו משוב</ExternalLink>
        </p>
      )}

      <TimeCalculator />

      <p className="print-only print-footer">{t('notice.afterLicense')}</p>
    </Page>
  );
}
