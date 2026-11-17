import { useId, useState } from 'react';
import { t } from '../../lib/content';

/** Conditional illustration only (brief section 10). Numbers stay in memory; nothing is saved or sent. */
export function TimeCalculator() {
  const id = useId();
  const [perWeek, setPerWeek] = useState(3);
  const [before, setBefore] = useState(60);
  const [after, setAfter] = useState(40);
  const [review, setReview] = useState(15);
  const diff = (before - (after + review)) * perWeek;
  const num = (v: string) => Math.max(0, Math.min(10_000, Number(v) || 0));
  return (
    <details className="calc no-print">
      <summary>המחשה מותנית: כמה זמן זה עשוי לקחת?</summary>
      <p className="muted">{t('calc.disclaimer')} ההמחשה נשארת בדפדפן ואינה נשמרת.</p>
      <div className="calc-grid">
        <label htmlFor={`${id}-a`}>כמה פעמים בשבוע</label>
        <input
          id={`${id}-a`}
          type="number"
          inputMode="numeric"
          min={0}
          value={perWeek}
          onChange={(e) => setPerWeek(num(e.target.value))}
        />
        <label htmlFor={`${id}-b`}>דקות למשימה היום</label>
        <input
          id={`${id}-b`}
          type="number"
          inputMode="numeric"
          min={0}
          value={before}
          onChange={(e) => setBefore(num(e.target.value))}
        />
        <label htmlFor={`${id}-c`}>דקות מוערכות עם הכלי</label>
        <input
          id={`${id}-c`}
          type="number"
          inputMode="numeric"
          min={0}
          value={after}
          onChange={(e) => setAfter(num(e.target.value))}
        />
        <label htmlFor={`${id}-d`}>דקות לבדיקה ולתיקונים</label>
        <input
          id={`${id}-d`}
          type="number"
          inputMode="numeric"
          min={0}
          value={review}
          onChange={(e) => setReview(num(e.target.value))}
        />
      </div>
      <p aria-live="polite">
        {diff > 0
          ? `לפי ההנחות שהזנתם, ההפרש הוא כ-${diff} דקות בשבוע, כולל זמן בדיקה ותיקונים.`
          : `לפי ההנחות שהזנתם, אין הפרש (${diff} דקות בשבוע) כשמביאים בחשבון בדיקה ותיקונים.`}{' '}
        {t('calc.disclaimer')}
      </p>
    </details>
  );
}
