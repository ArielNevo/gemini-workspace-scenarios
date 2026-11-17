import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { ExternalLink } from '../../components/ExternalLink';
import { siteConfig } from '../../lib/content';

export default function NoticePage() {
  return (
    <Page title="מה אסור להזין ולמה">
      <OrgDataNotice variant="full" />
      <section>
        <h2>מה אסור להזין</h2>
        <p>לא באתר הזה, ולא בכלי עצמו בזמן ההתנסות הראשונה:</p>
        <ul>
          <li>מידע אישי על עובדים או על אזרחים</li>
          <li>מידע מסווג או חסוי</li>
          <li>מידע שחל עליו חיסיון משפטי</li>
          <li>סודות מסחריים וקניין רוחני</li>
          <li>מסמכים פנימיים או תוכנם</li>
          <li>כל דבר שלא הייתם מפרסמים באתר ציבורי</li>
        </ul>
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
    </Page>
  );
}
