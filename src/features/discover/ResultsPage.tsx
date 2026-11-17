import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { DraftBadge, ToolBadge } from '../../components/Badges';
import { ExternalLink } from '../../components/ExternalLink';
import { getTopic, getUnit, scenarios, siteConfig, t, taxonomy } from '../../lib/content';
import { inputFromTopic, recommendForTopic } from '../../lib/recommend/topic';
import { ConsultCard } from '../../components/ConsultCard';
import { FamilyIcon } from '../../components/Illustrations';
import { decodeSelection, encodeSelection } from '../../lib/share';
import { useAppState } from '../../app/state';
import { ruleRecommender } from '../../app/recommender';
import type { FeedbackValue } from '../../lib/storage';
// Inline env comparison so the bundler drops the module (and Firebase) entirely when the flag is off.
const AiAssistPanel =
  import.meta.env.VITE_ENABLE_AI_ASSIST === 'true'
    ? lazy(() => import('../ai-assist/AiAssistPanel').then((m) => ({ default: m.AiAssistPanel })))
    : null;

const FEEDBACK: { value: FeedbackValue; label: string }[] = [
  { value: 'relevant', label: 'רלוונטי לי' },
  { value: 'not-like-my-work', label: 'לא דומה לעבודתי' },
  { value: 'show-other', label: 'רוצה לראות שימוש אחר' },
];

export default function ResultsPage() {
  const { state, dispatch } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const [aiNotice, setAiNotice] = useState(false);
  const params = new URLSearchParams(location.search);
  const topic = getTopic(params.get('topic') ?? '');
  const unit = getUnit(params.get('unit') ?? '');

  // Quick path: unit + topic → curated suggestions.
  useEffect(() => {
    if (!topic) return;
    dispatch({ type: 'setQuick', quick: { unitId: unit?.id ?? 'other', topicId: topic.id } });
    dispatch({ type: 'setResults', results: recommendForTopic(topic, scenarios) });
  }, [topic, unit, dispatch]);

  // A share link carries tag ids only; apply it once.
  useEffect(() => {
    const decoded = location.search ? decodeSelection(location.search.slice(1), taxonomy) : null;
    if (decoded) dispatch({ type: 'setInput', input: decoded });
  }, [location.search, dispatch]);

  useEffect(() => {
    if (topic || state.results !== null || state.input.tasks.length + state.input.outputs.length === 0)
      return;
    let live = true;
    void ruleRecommender.recommend(state.input).then((results) => {
      if (live) dispatch({ type: 'setResults', results });
    });
    return () => {
      live = false;
    };
  }, [topic, state.input, state.results, dispatch]);

  const empty = !topic && state.input.tasks.length === 0 && state.input.outputs.length === 0;
  const deepen = () => {
    if (topic) dispatch({ type: 'setInput', input: inputFromTopic(topic, unit?.cluster.role) });
    void navigate('/start');
  };
  const results = state.results;
  const shareHref = `#/results?${encodeSelection(state.input)}`;

  return (
    <Page title="אלה השימושים שכדאי לך לבדוק">
      <OrgDataNotice variant="inline" message="inline" />
      <OrgDataNotice variant="inline" message="experimentOnly" />
      {topic && (
        <p className="context-line">
          {unit && (
            <>
              <span className="badge">{unit.name}</span>{' '}
            </>
          )}
          <span className="badge badge-topic">{topic.label}</span> <Link to="/#quick">שנו</Link>
        </p>
      )}
      {empty ? (
        <p>
          עוד לא בחרתם משימות. <Link to="/start">התחילו כאן</Link>.
        </p>
      ) : (
        <div aria-live="polite" aria-busy={results === null}>
          {results === null && <p>מחשב התאמה…</p>}
          {results && results.length === 0 && (
            <div className="empty-state">
              <h2>{t('results.none')}</h2>
              <p>{t('results.noneHint')}</p>
              <div className="cta-row">
                <Link to="/catalog" className="button button-primary">
                  לקטלוג
                </Link>
                <Link to="/start" className="button">
                  שנו את הבחירות
                </Link>
              </div>
            </div>
          )}
          {results && results.length > 0 && (
            <>
              <p className="muted">
                נמצאו {results.length} שימושים. ההתאמה מבוססת על הבחירות שלכם בלבד, ואינה מבטיחה שהכלי יתאים
                לעבודה שלכם. הדרך לדעת היא להתנסות.
              </p>
              {aiNotice && <p className="notice-soft">{t('ai.unavailable')}</p>}
              <ol className="result-list">
                {results.map((r) => (
                  <li key={r.scenario.id} className={`card result-card fam-${r.scenario.family}`}>
                    <FamilyIcon family={r.scenario.family} />
                    <div className="card-badges">
                      <ToolBadge tool={r.scenario.tool} />
                      <DraftBadge status={r.scenario.status} />
                    </div>
                    <h2>{r.scenario.title}</h2>
                    <p>
                      <strong>מה אפשר לקבל: </strong>
                      {r.scenario.whatYouGet}
                    </p>
                    <p className="reason">{r.reason}</p>
                    {r.aiReason && <p className="muted small">{t('ai.reasonLabel')}</p>}
                    <div className="cta-row">
                      {r.scenario.demoId && (
                        <Link className="button button-primary" to={`/demo/${r.scenario.demoId}`}>
                          הראו לי דוגמה
                        </Link>
                      )}
                      <Link className="button" to={`/scenario/${r.scenario.id}`}>
                        פרטים
                        <span className="visually-hidden">: {r.scenario.title}</span>
                      </Link>
                    </div>
                    <div className="feedback" role="group" aria-label={`משוב על: ${r.scenario.title}`}>
                      {FEEDBACK.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          className="chip"
                          aria-pressed={state.feedback[r.scenario.id] === f.value}
                          onClick={() => dispatch({ type: 'setFeedback', id: r.scenario.id, value: f.value })}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                    {state.feedback[r.scenario.id] === 'show-other' && (
                      <p className="small">
                        <Link to={`/catalog?family=${r.scenario.family}`}>שימושים נוספים מאותו תחום</Link>
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <div className="cta-row">
                <Link to="/card" className="button button-primary">
                  לכרטיס השימושים שלי
                </Link>
                {topic ? (
                  <button type="button" className="button" onClick={deepen}>
                    דייקו את ההתאמה (2 שאלות)
                  </button>
                ) : (
                  <Link to="/start" className="button">
                    שנו את הבחירות
                  </Link>
                )}
                {!topic && (
                  <a href={shareHref} className="button">
                    קישור לבחירות האלה
                  </a>
                )}
              </div>
              {AiAssistPanel && (
                <Suspense fallback={null}>
                  <AiAssistPanel
                    input={state.input}
                    onResults={(res, usedAi, notice) => {
                      dispatch({ type: 'setResults', results: res, aiUsed: usedAi });
                      setAiNotice(notice);
                    }}
                  />
                </Suspense>
              )}
            </>
          )}
          <ConsultCard
            compact
            reason={
              results && results.length === 0
                ? 'לא מצאנו שימוש מובהק. אפשר לפנות ולספר במה אתם עוסקים, ונחשוב יחד.'
                : undefined
            }
          />
          <p className="small">
            {t('results.missingNeed')}
            {siteConfig.feedbackUrl ? (
              <>
                {' '}
                <ExternalLink href={siteConfig.feedbackUrl}>שלחו משוב</ExternalLink>
              </>
            ) : (
              ': ערוץ המשוב יתפרסם בקרוב.'
            )}
          </p>
        </div>
      )}
    </Page>
  );
}
