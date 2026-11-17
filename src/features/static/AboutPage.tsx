import { Page } from '../../components/Page';
import { formatDate } from '../../components/Badges';
import { scenarios, siteConfig } from '../../lib/content';

export default function AboutPage() {
  const drafts = scenarios.filter((s) => s.status === 'draft').length;
  return (
    <Page title="אודות האתר">
      <section>
        <h2>מה האתר</h2>
        <p>
          אתר שעוזר לעובדי הארגון שעדיין אין להם רישיון לגלות במה <bdi>Gemini</bdi> ו-
          <bdi>Gemini Notebook</bdi> (לשעבר <bdi>NotebookLM</bdi>) יכולים לעזור בעבודתם, ולבקש רישיון או
          להתנסות.
        </p>
        <p>{siteConfig.disclaimer}</p>
      </section>
      <section>
        <h2>מה האתר לא</h2>
        <ul>
          <li>אינו צ&apos;אטבוט ואינו מפעיל מודל שפה על מה שתכתבו.</li>
          <li>אינו מקבל מסמכים.</li>
          <li>אינו מבטיח חיסכון בזמן. הדרך לדעת היא להתנסות.</li>
          <li>אינו קובע מה מותר להזין לכלי. לשם כך יש את הנחיות הארגון.</li>
        </ul>
      </section>
      <section>
        <h2>איך מתעדכן התוכן</h2>
        <p>
          התרחישים וההדגמות נשמרים כקבצים בריפו ציבורי ב-<bdi>GitHub</bdi>. כל שינוי עובר בדיקה אוטומטית
          (מבנה, מקורות, ואיתור מידע שאסור לפרסם) לפני שהוא עולה לאתר.
        </p>
        <p>
          עדכון אחרון של הקטלוג: {formatDate(siteConfig.catalogUpdatedOn)}. {scenarios.length} שימושים, מתוכם{' '}
          {drafts} בסטטוס טיוטה שטרם נבדקה.
        </p>
      </section>
    </Page>
  );
}
