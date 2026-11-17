import { ExternalLink } from './ExternalLink';

const MEDIA = `${import.meta.env.BASE_URL}media/`;

const TRANSCRIPT = [
  'נהלים, פסקי דין, טיוטות, והערות שלא נגמרות. יותר מדי חומר, ומעט מדי זמן.',
  'Gemini עוזר להתחיל. טיוטה ראשונה מתוך נקודות, ניסוח פשוט לציבור, או תקציר של מסמך ארוך.',
  'ב-Gemini Notebook שואלים את המקורות שלכם, ומקבלים תשובה עם הפניה לקטע שעליו היא נשענת. ואפשר להפיק ממנו מדריך למידה, מילון מושגים, או סקירה קולית.',
  'ו-Gemini עובד גם בתוך הכלים שאתם כבר מכירים: במסמכים, בגיליונות ובדואר.',
  'שלושה כללים. עובדים בחשבון הארגוני. בודקים כל תשובה מול המקור. וכשיש ספק, מתייעצים.',
  'עכשיו תורכם. בחרו יחידה ונושא, וגלו איפה Gemini יכול לעזור בעבודה שלכם.',
];

/** Short film: narration in Ariel's cloned voice, product moments from Google Workspace's official channel (credited). */
export function FilmVideo() {
  return (
    <figure className="demo-video">
      <video
        controls
        playsInline
        preload="none"
        poster={`${MEDIA}film-poster.jpg`}
        aria-describedby="film-desc"
      >
        <source src={`${MEDIA}film.mp4`} type="video/mp4" />
      </video>
      <figcaption id="film-desc">
        <strong>Gemini ו-Gemini Notebook בעבודה, ב-50 שניות.</strong> כתוביות צרובות בסרטון. קריינות: הקול של
        אריאל נבו, משובט בבינה מלאכותית. קטעי המוצר מתוך{' '}
        <ExternalLink href="https://www.youtube.com/@googleworkspace">
          ערוץ Google Workspace ב-YouTube
        </ExternalLink>
        .
        <details>
          <summary>תמליל</summary>
          {TRANSCRIPT.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </details>
      </figcaption>
    </figure>
  );
}
