import { Link } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { FAMILY_LABELS, scenarios, t } from '../../lib/content';

export function HomePage() {
  return (
    <Page title={t('home.title')} className="home">
      <p className="lead">{t('home.subtitle')}</p>
      <p className="tools-line">
        <bdi>Gemini</bdi> ו-<bdi>Gemini Notebook</bdi> (לשעבר <bdi>NotebookLM</bdi>)
      </p>
      <div className="cta-row">
        <Link to="/start" className="button button-primary">
          {t('home.start')} <span className="button-hint">({t('home.startHint')})</span>
        </Link>
        <Link to="/catalog" className="button">
          {t('home.examples')}
        </Link>
      </div>
      <OrgDataNotice variant="inline" />
      <OrgDataNotice variant="inline" message="demos" />
      <section aria-labelledby="how" className="how">
        <h2 id="how">איך זה עובד</h2>
        <ol className="steps">
          <li>
            <strong>בוחרים</strong> מה מעסיק אתכם בעבודה ואיפה היא נעשית קשה. רק מתוך רשימות, בלי לכתוב.
          </li>
          <li>
            <strong>מקבלים</strong> עד שלושה שימושים שכדאי לבדוק, עם הסבר למה הם הוצעו.
          </li>
          <li>
            <strong>רואים דוגמה</strong> על מסמכים מדומים, ומקבלים תוכנית להתנסות ראשונה.
          </li>
        </ol>
        <p className="muted">
          בקטלוג {scenarios.length} שימושים בארבעה תחומים: {Object.values(FAMILY_LABELS).join(', ')}.
        </p>
      </section>
    </Page>
  );
}
