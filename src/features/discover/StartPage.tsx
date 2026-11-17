import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChoiceGroup } from '../../components/ChoiceGroup';
import { OrgDataNotice } from '../../components/OrgDataNotice';
import { Page } from '../../components/Page';
import { taxonomy } from '../../lib/content';
import { useAppState } from '../../app/state';
import type { DiscoveryInput } from '../../lib/recommend/types';

export default function StartPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [input, setInput] = useState<DiscoveryInput>(state.input);
  const set = (patch: Partial<DiscoveryInput>) => setInput((prev) => ({ ...prev, ...patch }));

  if (step === 1) {
    return (
      <Page title="מה מעסיק אותך בעבודה?" key="step1">
        <p className="step-indicator">שלב 1 מתוך 2</p>
        <OrgDataNotice variant="inline" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <ChoiceGroup
            name="tasks"
            legend="בחרו עד 3 משימות"
            hint="אין צורך בשם, במספר עובד או בפרטים אישיים."
            items={taxonomy.tasks}
            value={input.tasks}
            max={3}
            onChange={(tasks) => set({ tasks })}
          />
          <ChoiceGroup
            name="roles"
            legend="תחום פעילות (לא חובה)"
            items={taxonomy.roles}
            value={input.roles}
            multiple={false}
            onChange={(roles) => set({ roles })}
          />
          {input.roles.length > 0 && (
            <button type="button" className="link-button" onClick={() => set({ roles: [] })}>
              נקו את תחום הפעילות
            </button>
          )}
          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={input.tasks.length === 0}>
              המשך
            </button>
            {input.tasks.length === 0 && <p className="muted">בחרו לפחות משימה אחת כדי להמשיך.</p>}
          </div>
        </form>
      </Page>
    );
  }

  return (
    <Page title="איפה העבודה נעשית קשה או איטית?" key="step2">
      <p className="step-indicator">שלב 2 מתוך 2</p>
      <OrgDataNotice variant="inline" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'setInput', input });
          void navigate('/results');
        }}
      >
        <ChoiceGroup
          name="difficulties"
          legend="מה הקושי?"
          hint="אפשר לבחור כמה."
          items={taxonomy.difficulties}
          value={input.difficulties}
          onChange={(difficulties) => set({ difficulties })}
        />
        <ChoiceGroup
          name="materials"
          legend="עם איזה חומר אתם עובדים?"
          items={taxonomy.materials}
          value={input.materials}
          onChange={(materials) => set({ materials })}
        />
        <ChoiceGroup
          name="outputs"
          legend="מה התוצר הרצוי?"
          items={taxonomy.outputs}
          value={input.outputs}
          onChange={(outputs) => set({ outputs })}
        />
        <ChoiceGroup
          name="frequency"
          legend="באיזו תדירות?"
          items={taxonomy.frequency}
          value={input.frequency}
          multiple={false}
          onChange={(frequency) => set({ frequency })}
        />
        <ChoiceGroup
          name="materialClass"
          legend="סוג החומר בדרך כלל (ברמה כללית בלבד)"
          hint="הבחירה הזו לא משפיעה על ההמלצות. היא רק מוסיפה הערת זהירות מתאימה."
          items={taxonomy.materialClass}
          value={input.materialClass ? [input.materialClass] : []}
          multiple={false}
          onChange={([materialClass]) => set({ materialClass })}
        />
        <div className="form-actions">
          <button type="button" className="button" onClick={() => setStep(1)}>
            חזרה
          </button>
          <button type="submit" className="button button-primary">
            הראו לי שימושים
          </button>
        </div>
      </form>
    </Page>
  );
}
