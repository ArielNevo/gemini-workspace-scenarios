import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { formatDate } from '../../components/Badges';
import { getScenario, loadDemo, t, type Demo } from '../../lib/content';
import NotFoundPage from '../static/NotFoundPage';

type Of<K extends Demo['kind']> = Extract<Demo, { kind: K }>;
type Doc = Of<'brief'>['source'];

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function SourceDoc({
  doc,
  highlight,
  label,
  idPrefix = '',
}: {
  doc: Doc;
  highlight?: string | undefined;
  label?: string;
  idPrefix?: string;
}) {
  return (
    <article className="mock-doc" aria-label={label ?? doc.title}>
      <p className="mock-doc-tag">מסמך מדומה</p>
      <h3>{doc.title}</h3>
      {doc.sections.map((s) => (
        <section
          key={s.id}
          id={`${idPrefix}${s.id}`}
          className={`mock-section${highlight === s.id ? ' is-highlighted' : ''}`}
          tabIndex={-1}
          aria-current={highlight === s.id ? 'true' : undefined}
        >
          {s.heading && <h4>{s.heading}</h4>}
          <Paragraphs text={s.text} />
        </section>
      ))}
    </article>
  );
}

function focusSection(domId: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(domId);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
  });
}

function Tabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function VersionsDemo({ demo }: { demo: Of<'versions'> }) {
  const [v, setV] = useState(demo.versions[0]!.id);
  const current = demo.versions.find((x) => x.id === v)!;
  return (
    <>
      <Tabs label="בחירת גרסה" options={demo.versions} value={v} onChange={setV} />
      <div className="mock-doc" aria-live="polite">
        <p className="mock-doc-tag">{current.label}</p>
        <Paragraphs text={current.text} />
      </div>
    </>
  );
}

function BriefDemo({ demo }: { demo: Of<'brief'> }) {
  const [sel, setSel] = useState<string>();
  return (
    <div className="two-col">
      <section aria-labelledby="brief-h" className="mock-doc brief">
        <p className="mock-doc-tag">התוצר: תדריך</p>
        <h3 id="brief-h">{demo.brief.title}</h3>
        <p className="muted small">לחצו על עובדה כדי לראות את הקטע במקור שעליו היא נשענת.</p>
        <ul className="fact-list">
          {demo.brief.items.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                className="fact"
                aria-pressed={sel === item.sourceSectionId}
                onClick={() => {
                  setSel(item.sourceSectionId);
                  focusSection(`src-${item.sourceSectionId}`);
                }}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <SourceDoc doc={demo.source} highlight={sel} idPrefix="src-" label="מסמך המקור" />
    </div>
  );
}

const CHANGE_LABEL = { added: 'נוסף', removed: 'הוסר', changed: 'שונה' } as const;

function CompareDemo({ demo }: { demo: Of<'compare'> }) {
  const [sel, setSel] = useState<string>();
  const change = demo.changes.find((c) => c.id === sel);
  return (
    <>
      <table className="change-table">
        <caption>טבלת שינויים</caption>
        <thead>
          <tr>
            <th scope="col">סוג</th>
            <th scope="col">השינוי</th>
          </tr>
        </thead>
        <tbody>
          {demo.changes.map((c) => (
            <tr key={c.id} className={sel === c.id ? 'is-selected' : undefined}>
              <td>
                <span className={`badge change-${c.type}`}>{CHANGE_LABEL[c.type]}</span>
              </td>
              <td>
                <button
                  type="button"
                  className="fact"
                  aria-pressed={sel === c.id}
                  onClick={() => {
                    setSel(c.id);
                    focusSection(
                      c.afterSectionId ? `after-${c.afterSectionId}` : `before-${c.beforeSectionId}`,
                    );
                  }}
                >
                  {c.summary}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="two-col">
        <SourceDoc
          doc={demo.before}
          highlight={change?.beforeSectionId}
          idPrefix="before-"
          label="הגרסה הקודמת"
        />
        <SourceDoc
          doc={demo.after}
          highlight={change?.afterSectionId}
          idPrefix="after-"
          label="הגרסה החדשה"
        />
      </div>
    </>
  );
}

function QaDemo({ demo }: { demo: Of<'qa'> }) {
  const [q, setQ] = useState<string>();
  const current = demo.questions.find((x) => x.id === q);
  return (
    <div className="two-col">
      <section aria-labelledby="qa-h">
        <h3 id="qa-h">בחרו שאלה</h3>
        <ul className="fact-list">
          {demo.questions.map((x) => (
            <li key={x.id}>
              <button type="button" className="fact" aria-pressed={q === x.id} onClick={() => setQ(x.id)}>
                {x.question}
              </button>
            </li>
          ))}
        </ul>
        <div aria-live="polite">
          {current && (
            <div className="answer">
              <h4>תשובה</h4>
              <p>{current.answer}</p>
              <button
                type="button"
                className="link-button"
                onClick={() => focusSection(`qa-${current.sourceSectionId}`)}
              >
                לסעיף במקור
              </button>
            </div>
          )}
        </div>
      </section>
      <SourceDoc doc={demo.source} highlight={current?.sourceSectionId} idPrefix="qa-" label="הנוהל המדומה" />
    </div>
  );
}

function LearnDemo({ demo }: { demo: Of<'learn'> }) {
  type View = 'glossary' | 'map' | 'quiz' | 'source';
  const [view, setView] = useState<View>('glossary');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  return (
    <>
      <Tabs<View>
        label="בחירת תצוגה"
        value={view}
        onChange={setView}
        options={[
          { id: 'glossary', label: 'מילון מושגים' },
          { id: 'map', label: 'מפת נושאים' },
          { id: 'quiz', label: 'בדיקה עצמית' },
          { id: 'source', label: 'מסמך המקור' },
        ]}
      />
      <div className="mock-doc">
        {view === 'glossary' && (
          <dl className="glossary">
            {demo.glossary.map((g) => (
              <div key={g.term}>
                <dt>{g.term}</dt>
                <dd>{g.definition}</dd>
              </div>
            ))}
          </dl>
        )}
        {view === 'map' && (
          <ul className="topic-map">
            {demo.topicMap.map((tp) => (
              <li key={tp.topic}>
                <strong>{tp.topic}</strong>
                <ul>
                  {tp.subtopics.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {view === 'quiz' &&
          demo.quiz.map((q) => {
            const chosen = answers[q.id];
            return (
              <fieldset key={q.id} className="quiz-q">
                <legend>{q.question}</legend>
                {q.options.map((o, i) => (
                  <label key={o} className="choice">
                    <input
                      type="radio"
                      name={q.id}
                      checked={chosen === i}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
                <div aria-live="polite">
                  {chosen !== undefined && (
                    <p className={chosen === q.correctIndex ? 'ok' : 'warn'}>
                      {chosen === q.correctIndex ? 'נכון. ' : 'לא בדיוק. '}
                      {q.explanation}
                    </p>
                  )}
                </div>
              </fieldset>
            );
          })}
        {view === 'source' && <SourceDoc doc={demo.source} />}
      </div>
    </>
  );
}

function DraftsDemo({ demo }: { demo: Of<'drafts'> }) {
  const [aud, setAud] = useState(demo.audiences[0]!.id);
  const [len, setLen] = useState(demo.lengths[0]!.id);
  const draft = demo.drafts.find((d) => d.audience === aud && d.length === len);
  return (
    <div className="two-col">
      <section className="mock-doc" aria-labelledby="bullets-h">
        <p className="mock-doc-tag">נקודות גולמיות (מדומות)</p>
        <h3 id="bullets-h">הנקודות</h3>
        <ul>
          {demo.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="draft-h">
        <h3 id="draft-h">טיוטה</h3>
        <Tabs label="קהל יעד" options={demo.audiences} value={aud} onChange={setAud} />
        <Tabs label="אורך" options={demo.lengths} value={len} onChange={setLen} />
        <div className="mock-doc" aria-live="polite">
          {draft ? <Paragraphs text={draft.text} /> : <p>אין טיוטה לשילוב הזה.</p>}
        </div>
      </section>
    </div>
  );
}

function Provenance({ demo }: { demo: Demo }) {
  if (demo.provenance === 'generated-and-verified' && demo.generatedWith && demo.generatedOn) {
    return (
      <p className="provenance">
        הופקה ב-<bdi>{demo.generatedWith}</bdi> בתאריך {formatDate(demo.generatedOn)} ונבדקה
        {demo.verifiedBy ? ` (${demo.verifiedBy})` : ''}.
      </p>
    );
  }
  return <p className="provenance">{t('demo.illustrative')}</p>;
}

export default function DemoPage() {
  const { id = '' } = useParams();
  const [demo, setDemo] = useState<Demo | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    void loadDemo(id).then((d) => live && setDemo(d ?? null));
    return () => {
      live = false;
    };
  }, [id]);
  if (demo === undefined) return <p aria-live="polite">טוען הדגמה…</p>;
  if (demo === null) return <NotFoundPage />;
  const related = demo.relatedScenarios.map(getScenario).filter((s) => s !== undefined);
  return (
    <Page title={demo.title} className="demo-page">
      <Provenance demo={demo} />
      <OrgDataNotice variant="inline" message="demos" />
      <OrgDataNotice variant="inline" message="inline" />
      <p className="lead">{demo.intro}</p>
      {demo.kind === 'versions' && <VersionsDemo demo={demo} />}
      {demo.kind === 'brief' && <BriefDemo demo={demo} />}
      {demo.kind === 'compare' && <CompareDemo demo={demo} />}
      {demo.kind === 'qa' && <QaDemo demo={demo} />}
      {demo.kind === 'learn' && <LearnDemo demo={demo} />}
      {demo.kind === 'drafts' && <DraftsDemo demo={demo} />}
      <section className="can-vs-check" aria-labelledby="can-h">
        <h2 id="can-h">מה הכלי יכול לעשות כאן, ומה מחייב בדיקה מקצועית</h2>
        <p>
          <strong>מה הכלי יכול: </strong>
          {demo.toolCanDo}
        </p>
        <p>
          <strong>מה מחייב בדיקה: </strong>
          {demo.needsReview}
        </p>
      </section>
      {related.length > 0 && (
        <section aria-labelledby="rel-h">
          <h2 id="rel-h">שימושים קשורים</h2>
          <ul>
            {related.map((s) => (
              <li key={s.id}>
                <Link to={`/scenario/${s.id}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  );
}
