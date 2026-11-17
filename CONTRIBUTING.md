# איך מוסיפים או מעדכנים תרחיש

**לפני הכול:** הריפו פומבי. אין להוסיף מידע ארגוני, שמות אנשים, שמות של מערכות פנימיות, מסמכים אמיתיים, או שמות אמיתיים של גופים וחוקים בהדגמות.

## תרחיש חדש

1. צרו קובץ `content/scenarios/<id>.json`. ה-id באנגלית, kebab-case, וזהה לשם הקובץ.
2. מלאו את כל השדות לפי הסכמה ב-`src/lib/content/schema.ts`. העתיקו קובץ קיים כנקודת התחלה.
3. תגיות רק מתוך `content/taxonomy.json`.
4. `status: "draft"`, `capability.includedInOrgPackage: "unknown"`, `capability.verifiedInOrg: false`. רק אדם שבדק משנה אותם.
5. `capability.sourceUrl` הוא מקור רשמי של Google, ו-`checkedOn` הוא התאריך שבו נבדק בפועל.
6. `firstExperiment.materialSuggestion` מתאר סוג חומר מהעבודה בלשון כללית, בלי שמות של מסמכים, תיקים או מערכות אמיתיים.
7. אין הבטחות חיסכון, אין אחוזים, אין טענות על הגנת מידע או אזור נתונים של Google.
8. הריצו `npm run content:validate && npm run content:lint`.

## מעבר מ-draft ל-reviewed

בדקו כל טענה מול התיעוד הרשמי, עדכנו `checkedOn` ו-`hebrewSupport`, ורק אז שנו ל-`reviewed`.

## הדגמה שהופקה בכלי

אחרי שהפקתם את ההדגמה בכלי ובדקתם אותה: עדכנו את הטקסטים, ושנו `provenance` ל-`generated-and-verified` עם `generatedWith`, `generatedOn` ו-`verifiedBy` (תפקיד, לא שם).

## נוסחים

כל ההודעות הקבועות נמצאות ב-`content/copy.he.json`. מותר לשפר ניסוח, אסור לשנות משמעות של הודעות `notice.*`.
