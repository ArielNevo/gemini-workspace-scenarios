import { Link, useParams } from 'react-router-dom';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { DraftBadge, HebrewNote, StatusBadge, ToolBadge, ToolName } from '../../components/Badges';
import { FAMILY_LABELS, getScenario, t } from '../../lib/content';
import NotFoundPage from '../static/NotFoundPage';

export default function ScenarioPage() {
  const { id = '' } = useParams();
  const s = getScenario(id);
  if (!s) return <NotFoundPage />;
  return (
    <Page title={s.title} className="scenario-page">
      <div className="card-badges">
        <ToolBadge tool={s.tool} />
        <span className="badge">{FAMILY_LABELS[s.family]}</span>
        <DraftBadge status={s.status} />
      </div>
      <OrgDataNotice variant="inline" message="experimentOnly" />
      <p className="lead">{s.userNeed}</p>
      <section>
        <h2>מה אפשר להפיק</h2>
        <p>{s.whatYouGet}</p>
        <p>
          כלי מומלץ: <ToolName tool={s.tool} />
          {s.alternateTool && (
            <>
              . אפשר גם: <ToolName tool={s.alternateTool} />
            </>
          )}
          .
        </p>
      </section>
      <section>
        <h2>הדגמה</h2>
        {s.demoId ? (
          <p>
            <Link className="button button-primary" to={`/demo/${s.demoId}`}>
              הראו לי דוגמה
            </Link>
          </p>
        ) : (
          <p className="muted">{t('demo.notAvailable')}</p>
        )}
      </section>
      <section>
        <h2>ניסיון ראשון</h2>
        <p>
          <strong>במה להתנסות: </strong>
          {s.firstExperiment.materialSuggestion}
        </p>
        <ol>
          {s.firstExperiment.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <h3>מה נחשב הצלחה</h3>
        <ul>
          {s.firstExperiment.successCriteria.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="muted">זמן מומלץ להתנסות: עד {s.firstExperiment.timeBoxMinutes} דקות.</p>
      </section>
      <section>
        <h2>מה צריך לבדוק בתוצר</h2>
        <ul>
          {s.whatToVerify.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="muted">{t('verify.citations')}</p>
      </section>
      <section>
        <h2>מגבלות</h2>
        <ul>
          {s.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
      <StatusBadge scenario={s} />
      <HebrewNote scenario={s} />
      <p>
        <Link to="/catalog">חזרה לכל השימושים</Link>
      </p>
    </Page>
  );
}
