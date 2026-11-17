import { Link } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { ConsultCard } from '../../components/ConsultCard';
import { FamilyIcon, HeroArt, Sparkle } from '../../components/Illustrations';
import { FAMILY_LABELS, scenarios, t, type Family } from '../../lib/content';
import { QuickPath } from './QuickPath';
import { DemoVideo } from '../../components/DemoVideo';

const FAMILY_TEXT: Record<Family, string> = {
  understand: 'תמצית, תדריך ותשובות מתוך מסמכים',
  compare: 'מה השתנה, מה סותר ומה חסר',
  write: 'טיוטה ראשונה, ניסוח לקהל ומשוב',
  learn: 'מילון מושגים, הדרכה ובדיקה עצמית',
};

export function HomePage() {
  const count = (f: Family) => scenarios.filter((s) => s.family === f).length;
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">
            <Sparkle /> <bdi>Gemini</bdi> ו-<bdi>Gemini Notebook</bdi> (לשעבר <bdi>NotebookLM</bdi>)
          </p>
          <Page title={t('home.title')} className="hero-heading">
            <p className="lead">{t('home.subtitle')}</p>
          </Page>
          <div className="cta-row">
            <a href="#quick" className="button button-primary button-lg">
              {t('home.start')} <span className="button-hint">(דקה אחת)</span>
            </a>
            <Link to="/catalog" className="button button-ghost">
              {t('home.examples')}
            </Link>
          </div>
        </div>
        <HeroArt />
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

      <section aria-labelledby="see-it" className="see-it">
        <h2 id="see-it">ככה זה נראה, ב-15 שניות</h2>
        <DemoVideo />
      </section>

      <section aria-labelledby="families" className="families">
        <h2 id="families">ארבעה דברים שהכלים עושים טוב</h2>
        <ul className="family-grid">
          {(Object.keys(FAMILY_LABELS) as Family[]).map((f) => (
            <li key={f} className={`family-card fam-${f}`}>
              <Link to={`/catalog?family=${f}`}>
                <FamilyIcon family={f} />
                <strong>{FAMILY_LABELS[f]}</strong>
                <span>{FAMILY_TEXT[f]}</span>
                <span className="family-count">{count(f)} שימושים</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <OrgDataNotice variant="inline" message="demos" />
      <ConsultCard />
    </div>
  );
}
