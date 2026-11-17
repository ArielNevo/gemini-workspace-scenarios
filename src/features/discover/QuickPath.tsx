import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsForUnit, units } from '../../lib/content';
import { useAppState } from '../../app/state';

/** Two choices → suggestions. Unit and topic ids come from the catalog; nothing typed. */
export function QuickPath() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const id = useId();
  const [unitId, setUnitId] = useState(state.quick.unitId ?? '');
  const [topicId, setTopicId] = useState(state.quick.topicId ?? '');
  const topics = unitId ? topicsForUnit(unitId) : [];

  return (
    <form
      className="quick"
      aria-labelledby={`${id}-title`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!topicId) return;
        dispatch({ type: 'setQuick', quick: { unitId, topicId } });
        void navigate(`/results?unit=${encodeURIComponent(unitId)}&topic=${encodeURIComponent(topicId)}`);
      }}
    >
      <h2 id={`${id}-title`} className="quick-title">
        הכוונה מהירה: שתי בחירות
      </h2>
      <div className="quick-step">
        <span className="quick-num" aria-hidden="true">
          1
        </span>
        <div className="field">
          <label htmlFor={`${id}-unit`}>באיזו יחידה אתם עובדים?</label>
          <select
            id={`${id}-unit`}
            value={unitId}
            onChange={(e) => {
              setUnitId(e.target.value);
              setTopicId('');
            }}
          >
            <option value="">בחרו יחידה</option>
            {units.clusters.map((c) => (
              <optgroup key={c.id} label={c.label}>
                {c.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="other">יחידה אחרת או שאינני רוצה לציין</option>
          </select>
        </div>
      </div>
      <fieldset className="quick-step" disabled={!unitId}>
        <span className="quick-num" aria-hidden="true">
          2
        </span>
        <div>
          <legend>במה אתם עוסקים בעיקר?</legend>
          {!unitId && <p className="muted small">בחרו קודם יחידה.</p>}
          <div className="topic-chips">
            {topics.map((t) => (
              <label key={t.id} className={`topic-chip${topicId === t.id ? ' is-checked' : ''}`}>
                <input
                  type="radio"
                  name={`${id}-topic`}
                  value={t.id}
                  checked={topicId === t.id}
                  onChange={() => setTopicId(t.id)}
                />
                <span>
                  <strong>{t.label}</strong>
                  <span className="topic-hint">{t.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>
      <div className="form-actions">
        <button type="submit" className="button button-primary button-lg" disabled={!topicId}>
          הראו לי מה אפשר לעשות
        </button>
      </div>
    </form>
  );
}
