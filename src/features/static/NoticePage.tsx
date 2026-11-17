import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { ConsultCard } from '../../components/ConsultCard';
import { ExternalLink } from '../../components/ExternalLink';
import { siteConfig } from '../../lib/content';

export default function NoticePage() {
  return (
    <Page title="מה מזינים איפה">
      <OrgDataNotice variant="full" />
      <section>
        <h2>באתר הזה: לא מזינים מידע ארגוני</h2>
        <p>האתר פתוח לכולם, ולכן אין להזין בו:</p>
        <ul>
          <li>מידע אישי על עובדים או על אזרחים</li>
          <li>שמות, מספרי תיקים או תוכן ממסמכים</li>
          <li>מידע מסווג, חסוי או מידע שחל עליו חיסיון משפטי</li>
        </ul>
      </section>
      <section>
        <h2>ב-Gemini וב-Gemini Notebook: עובדים על מסמכי העבודה</h2>
        <p>
          בחשבון הארגוני אפשר לעבוד על המסמכים שלכם: נהלים, טיוטות, חוות דעת, טבלאות וסיכומים. לא צריך להסתפק
          בחומר פומבי. למידע מסווג, פעלו לפי הנחיות המשרד, ואם יש ספק, התייעצו.
        </p>
      </section>
      <section>
        <h2>מה האתר עושה</h2>
        <ul>
          <li>כל החישוב מתבצע בדפדפן שלכם. אין שרת שמקבל את הבחירות.</li>
          <li>אין חשבונות, אין עוגיות ואין סקריפטים של צד שלישי.</li>
          <li>אין באתר שדה לטקסט חופשי חוץ מתיבת החיפוש, והחיפוש לא נשלח ולא נשמר.</li>
          <li>מה שנשמר מקומית נשמר רק אם לחצתם &quot;שמור&quot;, ואפשר למחוק אותו בכל רגע.</li>
        </ul>
      </section>
      <section>
        <h2>אחרי קבלת רישיון</h2>
        <OrgDataNotice variant="inline" message="afterLicense" />
        <ul>
          <li>
            {siteConfig.orgGuidelinesUrl ? (
              <ExternalLink href={siteConfig.orgGuidelinesUrl}>הנחיות הארגון לשימוש בכלי AI</ExternalLink>
            ) : (
              'הנחיות הארגון לשימוש בכלי AI: הקישור יתפרסם בקרוב.'
            )}
          </li>
          {siteConfig.nationalGuideUrl && (
            <li>
              <ExternalLink href={siteConfig.nationalGuideUrl}>
                המדריך הממשלתי לשימוש אחראי בכלי בינה מלאכותית
              </ExternalLink>
            </li>
          )}
        </ul>
      </section>
      <ConsultCard />
    </Page>
  );
}
