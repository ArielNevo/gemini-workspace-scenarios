import { Link } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { ConsultCard } from '../../components/ConsultCard';
import { Presenter } from '../../components/Presenter';
import { FAMILY_LABELS, scenarios, t, type Family } from '../../lib/content';
import { QuickPath } from './QuickPath';
import { DemoVideo } from '../../components/DemoVideo';
import { FilmVideo } from '../../components/FilmVideo';

const FAMILY: Record<Family, { letter: string; text: string }> = {
  understand: { letter: 'ה', text: 'תמצית, תדריך ותשובות מתוך מסמכים' },
  compare: { letter: 'ש', text: 'מה השתנה, מה סותר ומה חסר' },
  write: { letter: 'כ', text: 'טיוטה ראשונה, ניסוח לקהל ומשוב' },
  learn: { letter: 'ל', text: 'מילון מושגים, הדרכה ובדיקה עצמית' },
};

function goQuick() {
  const el = document.getElementById('quick');
  el?.scrollIntoView({ block: 'start' });
  el?.querySelector<HTMLElement>('select')?.focus({ preventScroll: true });
}

export function HomePage() {
  const count = (f: Family) => scenarios.filter((s) => s.family === f).length;
  return (
    <div className="home">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="chip-label">
            <span className="dot" aria-hidden="true" />
            <span>
              <bdi>Gemini</bdi> ו-<bdi>Gemini Notebook</bdi>
            </span>
            <span className="muted">
              (לשעבר&nbsp;<bdi>NotebookLM</bdi>)
            </span>
          </p>
          <Page title={t('home.title')} className="hero-heading">
            <p className="lead">{t('home.subtitle')}</p>
          </Page>
          <div className="cta-row">
            <button type="button" className="pill pill-dark pill-lg" onClick={goQuick}>
              ↓ {t('home.start')}
            </button>
            <Link to="/catalog" className="pill pill-lg">
              {t('home.examples')} ←
            </Link>
          </div>
        </div>
        <Presenter onStart={goQuick} />
      </section>

      <OrgDataNotice variant="inline" />

      <section id="quick" className="quick-wrap">
        <QuickPath />
        <div className="deeper">
          <h2>רוצים להעמיק?</h2>
          <ul className="deeper-list">
            <li>
              <Link to="/start" className="deeper-link">
                <strong>התאמה מדויקת</strong>
                <span>שתי שאלות על הקושי, החומר והתוצר. 3–5 דקות.</span>
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="deeper-link">
                <strong>כל {scenarios.length} השימושים</strong>
                <span>חיפוש וסינון לפי תחום וכלי.</span>
              </Link>
            </li>
            <li>
              <Link to="/demo/demo-compare-procedures" className="deeper-link">
                <strong>הדגמה אינטראקטיבית</strong>
                <span>השוואת שתי גרסאות של נוהל מדומה.</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="families" className="families">
        <h2 id="families">ארבעה דברים שהכלים עושים טוב</h2>
        <ul className="family-grid">
          {(Object.keys(FAMILY_LABELS) as Family[]).map((f) => (
            <li key={f} className={`family-card fam-${f}`}>
              <Link to={`/catalog?family=${f}`}>
                <span className="family-letter" aria-hidden="true">
                  {FAMILY[f].letter}
                </span>
                <strong>{FAMILY_LABELS[f]}</strong>
                <span>{FAMILY[f].text}</span>
                <span className="family-count">{count(f)} שימושים ←</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="see-it" className="see-it">
        <h2 id="see-it">ככה זה נראה</h2>
        <div className="video-grid">
          <FilmVideo />
          <DemoVideo />
        </div>
      </section>

      <OrgDataNotice variant="inline" message="demos" />
      <ConsultCard />
    </div>
  );
}
