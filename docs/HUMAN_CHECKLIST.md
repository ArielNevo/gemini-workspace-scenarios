# מה נשאר לבעל המוצר

פעולות שקלוד קוד לא יכול לבצע, או שההחלטה בהן שלכם.

## 1. בדיקת תוכן

- [ ] לעבור על 25 התרחישים ב-`content/scenarios`, לאמת כל טענה מול התיעוד הרשמי, ולעדכן `status`, `checkedOn` ו-`hebrewSupport`.
- [ ] לבדוק במיוחד: הניסוח "מקורות שמייבאים מ-Drive מועתקים למחברת" (דף הניהול של Google מדבר על סנכרון ומטמון), סקירות קוליות בעברית (#6), ו-Deep Research בעברית (#12).
- [ ] לוודא שאין בתרחישים דבר שמרמז על זמינות בארגון או על חיסכון.

## 2. הפקת הדגמות בכלי

- [ ] להפיק לפחות את הדגמות הליבה ב-Gemini וב-Gemini Notebook, על אותם מסמכים מדומים, לבדוק, ולעדכן ל-`generated-and-verified` עם `generatedWith`, `generatedOn` ו-`verifiedBy` (תפקיד).

## 3. תצורה (`config/site.config.json`)

- [ ] `requestAccess`: לבחור `url` (טופס, עם `prefill.param` אם רוצים מילוי מראש) או `mailto`, או להשאיר `none`.
- [ ] `feedbackUrl`, `orgGuidelinesUrl`.
- [ ] לפתוח ידנית את `nationalGuideUrl` ולוודא שהוא תקין. אם לא, לרוקן אותו (הקישור יוסתר).
- [ ] `orgDisplayName` ו-`logoPath` רק אם התקבל אישור.
- [ ] לעדכן `catalogUpdatedOn` בכל עדכון קטלוג.

## 4. אישורים ארגוניים

- [ ] אישור לפרסום ציבורי ולשימוש בשם הארגון, אם רלוונטי (תקשורת, אבטחת מידע, משפטי).

## 5. ריפו ופריסה

- [ ] הריפו נוצר **פרטי**. אחרי האישור: Settings ← General ← Change visibility ← Public.
- [ ] Settings ← Pages ← Source: **GitHub Actions**. הפריסה רצה אוטומטית בכל push ל-main (ומדלגת כל עוד הריפו פרטי).
- [ ] לבחור רישיון לריפו.
- [ ] Settings ← Secrets and variables ← Actions ← Secrets: להגדיר `CONTENT_FORBIDDEN_TERMS` (מונחים פנימיים, מופרדים בפסיקים). לא בקוד.
- [ ] לדומיין מותאם: משתנה `PAGES_BASE_PATH` = `/`.
- [ ] להריץ Lighthouse על האתר החי ולוודא מעל 90.

## 6. הפעלת הכוונה חכמה (רק אם מחליטים)

- [ ] ליצור פרויקט Firebase במסלול Spark, **בלי חשבון חיוב**.
- [ ] בקונסולה: AI Services ← AI Logic ← Get started ← Gemini Developer API.
- [ ] לרשום אפליקציית ווב ולהעתיק את ההגדרות ל-repository variables (`VITE_FIREBASE_*`).
- [ ] ליצור מפתח reCAPTCHA Enterprise מסוג Web לדומיין של GitHub Pages (בלי localhost), לרשום ב-App Check, ולאכוף App Check על AI Logic. לבדוק שיצירת המפתח אינה דורשת חשבון חיוב. אם היא דורשת, לעצור ולהשאיר את המודול כבוי.
- [ ] לבחור מודל יציב בשכבה החינמית מהתיעוד הרשמי ולהגדיר `VITE_GEMINI_MODEL`.
- [ ] להריץ מקומית עם הדגל, לזהות את הדומיינים שנדרשים ב-CSP, ולהגדיר `VITE_CSP_EXTRA_CONNECT` / `_SCRIPT` / `_FRAME`. לתעד ב-DECISIONS.md.
- [ ] מומלץ (לא אומת בתיעוד): להגביל את מפתח ה-API של הדפדפן לדומיין האתר.
- [ ] לעיין ב-Data governance & Responsible AI של Firebase AI Logic ובתנאי השכבה החינמית, לקבל אישור פרטיות ואבטחה, ולעדכן את `ai.disclosure` ב-`content/copy.he.json` בהתאם.
- [ ] להגדיר את המשתנה `VITE_ENABLE_AI_ASSIST=true`, לפרוס, ולבדוק התנהגות כשהמכסה נגמרת.
